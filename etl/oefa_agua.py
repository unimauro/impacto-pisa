#!/usr/bin/env python3
"""OEFA — Monitoreos de calidad de agua superficial (Datos Abiertos, CSV ~270 MB, desde 2014).
Filtra As, Hg, Pb, Cd; convierte UTM (zonas 17/18/19 S) a WGS84; asigna distrito por punto-en-polígono.
Salidas: app/public/data/oefa-agua-puntos.json (muestras individuales, compactas) y data/processed/oefa_agua_distrito.csv.
Umbrales ECA Agua DS 004-2017-MINAM (mg/L): cat.1-A1 (potabilizable con desinfección) As 0,01 Hg 0,001 Pb 0,01 Cd 0,003;
cat.3 riego/bebida de animales D1 As 0,1 Hg 0,001 Pb 0,05 Cd 0,01. Se conserva SIGNO ('<' = bajo LD) y unidad.
"""
import pandas as pd, json, os, math, collections
from pyproj import Transformer
from shapely.geometry import shape, Point
from shapely.strtree import STRtree
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.path.join(HERE, "..", "data", "raw"); PROC = os.path.join(HERE, "..", "data", "processed"); OUT = os.path.join(HERE, "..", "app", "public", "data")
SRC = os.path.join(RAW, "oefa-monitoreos-agua-superficial.csv")
PAR = {"Arsénico": "as", "Mercurio": "hg", "Plomo": "pb", "Cadmio": "cd"}
ECA = {"as": (0.01, 0.1), "hg": (0.001, 0.001), "pb": (0.01, 0.05), "cd": (0.003, 0.01)}  # (A1, cat3-D1)
gj = json.load(open(os.path.join(RAW, "peru-distrital.geojson"))); geoms = [shape(f["geometry"]) for f in gj["features"]]; keys = [f["properties"]["IDDIST"] for f in gj["features"]]; tree = STRtree(geoms)
def locate(lon, lat):
    pt = Point(lon, lat)
    for i in tree.query(pt):
        if geoms[i].covers(pt): return keys[i]
    return None
tr = {z: Transformer.from_crs(f"EPSG:{32700 + z}", "EPSG:4326", always_xy=True) for z in (17, 18, 19)}
VALCOLS = ["Metales.Totales", "Metales.Totales.por.ICP.MS.incluido.Hg", "Metales.Disueltos", "Metales.Disueltos.por.ICP.MS.incluido.Hg", "OTROS"]
import sys
rows = []; bad = 0
FAST = os.path.exists(os.path.join(PROC, "oefa_agua_muestras.csv")) and "--full" not in sys.argv
for ch in ([] if FAST else pd.read_csv(SRC, encoding="utf-8-sig", dtype=str, chunksize=200_000, on_bad_lines="skip", low_memory=False)):
    ch.columns = [c.strip('"') for c in ch.columns]
    ch = ch[ch["PARAMETRO"].isin(PAR) & ch["MATRIZ"].fillna("").str.contains("Agua Superficial", case=False)]
    for r in ch.itertuples(index=False):
        val = None; frac = None
        rec = dict(zip(ch.columns, r))
        for c in VALCOLS:
            v = rec.get(c)
            if v not in (None, "", "nan") and not (isinstance(v, float) and math.isnan(v)):
                try: val = float(str(v).replace(",", ".")); frac = "disuelto" if "Disuelt" in c else ("total" if "Total" in c else "otros"); break
                except: pass
        if val is None: continue
        try: z = int(float(rec.get("TXZONA") or 0)); e = float(rec.get("COORD_ESTE")); n = float(rec.get("COORD_NORTE"))
        except: bad += 1; continue
        if z not in tr or not (100000 < e < 900000 and 8000000 < n < 10000000): bad += 1; continue
        lon, lat = tr[z].transform(e, n)
        if not (-82 < lon < -68 and -19 < lat < 0.5): bad += 1; continue
        unit = str(rec.get("UNIDAD_MEDIDA_PARAMETRO") or "").strip()
        if unit.lower() in ("ug/l", "µg/l", "μg/l"): val = val / 1000; unit = "mg/L"
        if unit.lower() != "mg/l": continue
        el = PAR[rec["PARAMETRO"]]; sig = str(rec.get("SIGNO_PARAMETRO") or "=").strip()
        u = locate(lon, lat)
        rows.append([round(lon, 4), round(lat, 4), int(float(rec.get("ANHO") or 0)), el, val, sig, frac, u, str(rec.get("COORDINACION") or "")[:20], str(rec.get("PUNTO_MUESTREO") or "")[:30]])
if FAST:
    df = pd.read_csv(os.path.join(PROC, "oefa_agua_muestras.csv"), dtype={"ubigeo": str, "punto": str, "coordinacion": str}); print("modo rápido desde muestras.csv", len(df))
else:
    print("muestras", len(rows), "descartadas", bad)
    df = pd.DataFrame(rows, columns=["lon", "lat", "anio", "el", "val", "signo", "frac", "ubigeo", "coordinacion", "punto"])
    df.to_csv(os.path.join(PROC, "oefa_agua_muestras.csv"), index=False)
df["ubigeo"] = df["ubigeo"].where(df["ubigeo"].notna(), None); df["coordinacion"] = df["coordinacion"].fillna(""); df["punto"] = df["punto"].fillna("")
# Por distrito × elemento: n, n puntos, % > A1, % > cat3, máx, años
agg = []
for (u, el), g in df[df.ubigeo.notna()].groupby(["ubigeo", "el"]):
    a1, c3 = ECA[el]; det = g[g.signo != "<"]
    agg.append({"ubigeo": u, "el": el, "n": len(g), "n_puntos": g.punto.nunique(), "pct_sobre_a1": round(100 * (g.val > a1).mean(), 1), "pct_sobre_cat3": round(100 * (g.val > c3).mean(), 1),
                "max": g.val.max(), "med_detectado": det.val.median() if len(det) else None, "anio_min": int(g.anio.min()), "anio_max": int(g.anio.max())})
pd.DataFrame(agg).to_csv(os.path.join(PROC, "oefa_agua_distrito.csv"), index=False)
# Puntos compactos para el mapa: una fila por (punto, elemento) con máximo y último año, para no cargar 75k filas
pts = []
for (lon, lat, el), g in df.groupby(["lon", "lat", "el"]):
    a1, c3 = ECA[el]
    u = g.ubigeo.dropna(); u = u.iloc[0] if len(u) else None
    pts.append([lon, lat, el, round(float(g.val.max()), 5), int(g.anio.max()), len(g), int((g.val > a1).sum()), int((g.val > c3).sum()), u, str(g.coordinacion.mode().iloc[0]) if len(g) else ""])
json.dump({"campos": ["lon", "lat", "el", "max_mg_l", "ultimo_anio", "n", "n_sobre_a1", "n_sobre_cat3", "ubigeo", "coordinacion"], "eca": ECA, "n_muestras": len(df), "puntos": pts},
          open(os.path.join(OUT, "oefa-agua-puntos.json"), "w"), ensure_ascii=False, separators=(",", ":"), allow_nan=False)
print("puntos", len(pts), "distritos", df.ubigeo.nunique())
print(df.groupby("el").apply(lambda g: pd.Series({"n": len(g), "pct>A1": round(100 * (g.val > ECA[g.name][0]).mean(), 1), "pct>cat3": round(100 * (g.val > ECA[g.name][1]).mean(), 1)})))
