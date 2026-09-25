#!/usr/bin/env python3
"""Integra todas las fuentes a nivel DISTRITO (UBIGEO 6 dígitos) y emite los JSON estáticos del dashboard.
Salidas (app/public/data/):
  distritos.json        — 1 fila por distrito con ambiente, salud, educación, socioeconómico y flags de cobertura
  puntos-sedimentos.json— muestras INGEMMET (lon, lat, As, Hg, Pb, Cd, año, ubigeo) para el mapa de muestreo
  puntos-pam.json       — pasivos ambientales mineros (MINEM) puntuales
  puntos-aguas.json     — geoquímica de aguas superficiales INGEMMET (54 puntos) con As/Hg/Pb/Cd en mg/L
  resumen.json          — KPIs nacionales y de cobertura
Reglas: no se inventan datos; ausencia = null. Valores '<LD' se sustituyen por LD/2 SOLO para estadísticos de
tendencia central (se registra n_ld). 'N.R.' (no reportado) = null.
"""
import json, os, re, math, statistics, datetime, collections
import pandas as pd
from shapely.geometry import shape, Point
from shapely.strtree import STRtree

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "..", "data", "raw"); PROC = os.path.join(HERE, "..", "data", "processed")
OUT = os.path.join(HERE, "..", "app", "public", "data"); os.makedirs(OUT, exist_ok=True)

def load(name): return json.load(open(os.path.join(RAW, name)))

# ---------- 1. Territorio ----------
gj = load("peru-distrital.geojson")
dist = {}; geoms = []; keys = []
for f in gj["features"]:
    p = f["properties"]; u = p["IDDIST"]
    dist[u] = {"ubigeo": u, "distrito": p["NOMBDIST"].title(), "provincia": p["NOMBPROV"].title(), "departamento": p["NOMBDEP"].title()}
    g = shape(f["geometry"]); geoms.append(g); keys.append(u)
tree = STRtree(geoms)
def locate(lon, lat):
    if lon is None or lat is None or not (-82 < lon < -68 and -19 < lat < 0.5): return None
    pt = Point(lon, lat)
    for i in tree.query(pt):
        if geoms[i].covers(pt): return keys[i]
    return None
print("distritos", len(dist))

# ---------- 2. Socioeconómico (QHAWAY: INEI Censo 2017 / PNUD IDH 2019 / INEI pobreza) ----------
for r in load("indicadores-distrito-qhaway.json"):
    d = dist.get(r["ubigeo"])
    if not d: continue
    d.update({"pob": r.get("pob"), "idh": r.get("idh"), "pobreza": r.get("pobreza"), "pobreza_ext": r.get("pobrezaExt"),
              "vuln_alim": r.get("vulnAlim"), "altitud": r.get("altitud"), "agua_red": r.get("agua"), "desague_red": r.get("desague"),
              "electricidad": r.get("electricidad"), "internet": r.get("internet")})

# ---------- 3. Educación: ENLA 2024 4º primaria (UMC-MINEDU) ----------
enla = load("enla2024_umc.json")["distritos"]; n_enla = 0
for r in enla:
    d = dist.get(r["cod"])
    if not d: continue
    n_enla += 1
    d.update({"enla_lec_sat": r["lec_sat"], "enla_mat_sat": r["mat_sat"], "enla_lec_prev": r["lec_prev"], "enla_mat_prev": r["mat_prev"],
              "enla_cob_est": r["cob_est"], "enla_cob_ie": r["cob_ie"]})
print("enla distritos unidos", n_enla, "de", len(enla))

# ---------- 4. Geoquímica de sedimentos (INGEMMET) ----------
def num(v):
    """Devuelve (valor, es_ld). '<0.1' -> (0.05, True). 'N.R.'/None -> (None, False). '>10000' -> (10000, False)."""
    if v is None: return None, False
    s = str(v).strip().replace(",", ".")
    if s in ("", "N.R.", "NR", "-", "NA", "n.d."): return None, False
    if s.startswith("<"):
        try: return float(s[1:]) / 2, True
        except: return None, False
    if s.startswith(">"): s = s[1:]
    try: v = float(s)
    except: return None, False
    if v < 0: return abs(v) / 2, True   # convención de laboratorio: -10 = "< 10" (bajo el límite de detección)
    if v == 0: return None, False       # 0 exacto = no analizado en estas bases
    return v, False
sed = load("ingemmet-sedimentos.geojson"); pts_sed = []; by_d = collections.defaultdict(list)
for f in sed["features"]:
    p = f["properties"]; lon, lat = f["geometry"]["coordinates"][:2]
    u = locate(lon, lat)
    as_, as_ld = num(p.get("AS_PPM")); pb, _ = num(p.get("PB_PPM")); cd, _ = num(p.get("CD_PPM")); cu, _ = num(p.get("CU_PPM"))
    hg_ppm, hg_ld = num(p.get("HG_PPM")); hg_ppb, hg_ppb_ld = num(p.get("HG_PPB"))
    hg = hg_ppb if hg_ppb is not None else (hg_ppm * 1000 if hg_ppm is not None else None)  # ppb
    yr = str(p.get("ANO_DEL_P") or "")
    pts_sed.append([round(lon, 4), round(lat, 4), as_, hg, pb, cd, yr, u, p.get("CODIGO")])
    if u: by_d[u].append({"as": as_, "as_ld": as_ld, "hg": hg, "hg_ld": hg_ld or hg_ppb_ld, "pb": pb, "cd": cd, "cu": cu, "yr": yr})
def stats(vals):
    v = [x for x in vals if x is not None]
    if not v: return None
    v.sort(); n = len(v)
    return {"n": n, "med": round(statistics.median(v), 2), "p90": round(v[min(n - 1, int(math.ceil(0.9 * n)) - 1)], 2), "max": round(v[-1], 2)}
# Referencias orientativas (NO son ECA para sedimentos, Perú no tiene): ECA Suelo agrícola DS 011-2017-MINAM y CCME PEL (Canadá, sedimento de agua dulce)
REF = {"as": {"eca_suelo_agr": 50, "ccme_pel": 17}, "hg": {"eca_suelo_agr": 6600, "ccme_pel": 486}, "pb": {"eca_suelo_agr": 70, "ccme_pel": 91.3}, "cd": {"eca_suelo_agr": 1.4, "ccme_pel": 3.5}}
for u, rows in by_d.items():
    d = dist[u]; d["sed_n"] = len(rows)
    yrs = sorted({r["yr"] for r in rows if r["yr"]}); d["sed_anios"] = f"{yrs[0]}–{yrs[-1]}" if yrs else None
    for el in ("as", "hg", "pb", "cd", "cu"):
        s = stats([r[el] for r in rows])
        if s:
            d[f"sed_{el}_n"] = s["n"]; d[f"sed_{el}_med"] = s["med"]; d[f"sed_{el}_p90"] = s["p90"]; d[f"sed_{el}_max"] = s["max"]
            if el in REF:
                d[f"sed_{el}_pct_pel"] = round(100 * sum(1 for r in rows if r[el] is not None and r[el] > REF[el]["ccme_pel"]) / s["n"], 1)
    d["sed_as_n_ld"] = sum(1 for r in rows if r["as_ld"]); d["sed_hg_n_ld"] = sum(1 for r in rows if r["hg_ld"])
print("sedimentos asignados", sum(len(v) for v in by_d.values()), "/", len(pts_sed), "distritos con muestras", len(by_d))

# ---------- 5. Pasivos ambientales mineros (MINEM vía GEOCATMIN) ----------
pam = load("minem-pam.geojson"); pts_pam = []; cnt = collections.Counter(); cnt_tipo = collections.defaultdict(collections.Counter)
for f in pam["features"]:
    p = f["properties"]; lon, lat = f["geometry"]["coordinates"][:2]; u = locate(lon, lat)
    if not u:  # respaldo por nombre
        for k, d in dist.items():
            if d["distrito"].upper() == (p.get("DISTRITO") or "").upper() and d["departamento"].upper() == (p.get("REGION") or "").upper(): u = k; break
    pts_pam.append([round(lon, 4), round(lat, 4), p.get("TIPO"), p.get("SUBTIPO"), p.get("EXUNIDAD"), p.get("RESPONSABLE"), u])
    if u: cnt[u] += 1; cnt_tipo[u][p.get("TIPO") or "?"] += 1
for u, n in cnt.items():
    dist[u]["pam_n"] = n; dist[u]["pam_residuo_n"] = cnt_tipo[u].get("RESIDUO MINERO", 0)
print("PAM asignados", sum(cnt.values()), "/", len(pts_pam))

# ---------- 6. REINFO (MINEM vía GEOCATMIN) ----------
rf = load("minem-reinfo.geojson"); c_v = collections.Counter(); c_s = collections.Counter(); c_b = collections.Counter(); miss = 0
for f in rf["features"]:
    p = f["properties"]; lon, lat = f["geometry"]["coordinates"][:2]; u = locate(lon, lat)
    if not u: miss += 1; continue
    (c_v if p.get("ESTADO") == "VIGENTE" else c_s)[u] += 1
    if p.get("TIPO_ACT") == "BENEFICIO": c_b[u] += 1
for u in set(c_v) | set(c_s):
    dist[u]["reinfo_vigente"] = c_v.get(u, 0); dist[u]["reinfo_suspendido"] = c_s.get(u, 0); dist[u]["reinfo_beneficio"] = c_b.get(u, 0)
    dist[u]["reinfo_total"] = c_v.get(u, 0) + c_s.get(u, 0)
print("REINFO sin distrito", miss)

# ---------- 7. Capas del Observatorio Ambiental Peruano (OSINERGMIN/OEFA/SERNANP) ----------
def count_layer(name, field, prop=None, filt=None):
    c = collections.Counter(); total = 0
    for f in load(name)["features"]:
        if not f.get("geometry"): continue
        if filt and not filt(f["properties"]): continue
        g = shape(f["geometry"]); pt = g if g.geom_type == "Point" else g.representative_point()
        u = locate(pt.x, pt.y); total += 1
        if u: c[u] += 1
    for u, n in c.items(): dist[u][field] = n
    print(name, field, sum(c.values()), "/", total)
count_layer("oap-unidades-mineras.geojson", "um_n")
count_layer("oap-unidades-mineras.geojson", "um_produccion_n", filt=lambda p: (p.get("situacion") or "").upper().startswith("EXPLOT"))
count_layer("oap-relaves-oefa-puntos.geojson", "relaves_n")
count_layer("oap-mineria-ilegal-anp.geojson", "mineria_ilegal_anp_n")
count_layer("oap-pasivos-hidrocarburos.geojson", "pasivos_hc_n")
count_layer("oap-riesgo-ambiental-oefa.geojson", "riesgo_oefa_alto_n")
count_layer("oap-lotes-petroleros.geojson", "lotes_hc_n")

# ---------- 8. Aguas superficiales (INGEMMET, 54 puntos) ----------
ag = load("ingemmet-aguas-superficiales.geojson"); pts_ag = []
for f in ag["features"]:
    p = f["properties"]; lon, lat = f["geometry"]["coordinates"][:2]
    row = {"lon": round(lon, 4), "lat": round(lat, 4), "codigo": p.get("CODIGO"), "nombre": p.get("NOMBRE"), "informe": p.get("INFORME"), "ubigeo": locate(lon, lat)}
    for el in ("AS", "HG", "PB", "CD", "CU", "FE", "MN", "AL"):
        v, ld = num(p.get(f"{el}_MG_L")); row[el.lower()] = v; row[el.lower() + "_ld"] = ld
    pts_ag.append(row)

# ---------- 9. Mortalidad SINADEF por distrito de domicilio ----------
sin = pd.read_csv(os.path.join(PROC, "sinadef_distrital.csv"), dtype={"ubigeo": str})
sin = sin[sin.ubigeo.isin(dist.keys())]
A0, A1 = 2019, 2025  # ventana para tasas (excluye rollout 2017-18 y el año parcial)
win = sin[(sin.anio >= A0) & (sin.anio <= A1)]
tot = win.groupby(["ubigeo", "grupo"]).defunciones.sum().unstack(fill_value=0)
serie = sin[sin.grupo == "total"].pivot_table(index="ubigeo", columns="anio", values="defunciones", aggfunc="sum", fill_value=0)
for u, row in tot.iterrows():
    d = dist[u]; pob = d.get("pob")
    d["def_total_19_25"] = int(row.get("total", 0))
    for g in ("renal", "hepatica", "cancer", "cancer_piel", "cancer_vejiga_rinon", "cancer_pulmon", "intox_metales", "intox_plaguicidas", "dermatologica", "neuro", "perinatal_congenita", "cardiovascular", "respiratoria", "externas", "total", "total_menor5"):
        n = int(row.get(g, 0)); d[f"def_{g}"] = n
        if pob and pob >= 1000:
            d[f"tasa_{g}"] = round(n / (pob * (A1 - A0 + 1)) * 1e5, 1)  # por 100 mil hab-año, cruda
    d["tasa_inestable"] = not (pob and pob >= 5000)
    if u in serie.index: d["def_serie"] = {int(k): int(v) for k, v in serie.loc[u].items()}
print("SINADEF distritos", len(tot))

# ---------- 9b. Gasto público por distrito (SIAF-MEF Datos Abiertos, agregado por QHAWAY; ubicación = unidad ejecutora) ----------
for y in (2021, 2022, 2023, 2025, 2026):
    fn = os.path.join(RAW, f"mef-gasto-distrito-{y}.json")
    if not os.path.exists(fn): continue
    agg = collections.defaultdict(lambda: [0.0, 0.0])
    for r in json.load(open(fn)):
        a = agg[r["ubigeo"]]; a[0] += r.get("pim") or 0; a[1] += r.get("devengado") or 0
    for u, (pim, dev) in agg.items():
        if u in dist:
            dist[u][f"gasto_pim_{y}"] = round(pim); dist[u][f"gasto_dev_{y}"] = round(dev)
            if dist[u].get("pob"): dist[u][f"gasto_dev_pc_{y}"] = round(dev / dist[u]["pob"])
print("gasto MEF unido")

# ---------- 10. Cobertura y salida ----------
rows = list(dist.values())
def has(d, k): return d.get(k) is not None
for d in rows:
    d["cob"] = {"edu": has(d, "enla_lec_sat"), "sed": has(d, "sed_n"), "pam": has(d, "pam_n"), "reinfo": has(d, "reinfo_total"),
                "salud": has(d, "def_total_19_25"), "socio": has(d, "pobreza"), "gasto": has(d, "gasto_dev_2025"), "agua": any(a["ubigeo"] == d["ubigeo"] for a in pts_ag)}
    for k in ("pam_n", "pam_residuo_n", "reinfo_vigente", "reinfo_suspendido", "reinfo_beneficio", "reinfo_total", "um_n", "um_produccion_n", "relaves_n", "mineria_ilegal_anp_n", "pasivos_hc_n", "riesgo_oefa_alto_n", "lotes_hc_n"):
        d.setdefault(k, 0)  # conteo de un inventario nacional: 0 = no hay registro en ese inventario (no "sin dato")
json.dump(rows, open(os.path.join(OUT, "distritos.json"), "w"), ensure_ascii=False, separators=(",", ":"))
json.dump({"campos": ["lon", "lat", "as_ppm", "hg_ppb", "pb_ppm", "cd_ppm", "anio", "ubigeo", "codigo"], "n": len(pts_sed), "puntos": pts_sed},
          open(os.path.join(OUT, "puntos-sedimentos.json"), "w"), ensure_ascii=False, separators=(",", ":"))
json.dump({"campos": ["lon", "lat", "tipo", "subtipo", "ex_unidad", "responsable", "ubigeo"], "n": len(pts_pam), "puntos": pts_pam},
          open(os.path.join(OUT, "puntos-pam.json"), "w"), ensure_ascii=False, separators=(",", ":"))
json.dump(pts_ag, open(os.path.join(OUT, "puntos-aguas.json"), "w"), ensure_ascii=False, separators=(",", ":"))
res = {"generado": datetime.datetime.now().isoformat(timespec="seconds"), "n_distritos": len(rows),
       "cobertura": {k: sum(1 for d in rows if d["cob"][k]) for k in rows[0]["cob"]},
       "sedimentos": {"n": len(pts_sed), "asignados": sum(1 for p in pts_sed if p[7]), "anios": "2000–2018",
                      "as_sobre_pel": sum(1 for p in pts_sed if p[2] is not None and p[2] > 17), "hg_sobre_pel": sum(1 for p in pts_sed if p[3] is not None and p[3] > 486)},
       "pam": {"n": len(pts_pam)}, "reinfo": {"n": len(rf["features"]), "vigente": sum(c_v.values()), "suspendido": sum(c_s.values())},
       "sinadef": {"anios_tasa": [A0, A1], "def_total": int(win[win.grupo == "total"].defunciones.sum()), "t56_total_2017_2026": int(sin[sin.grupo == "intox_metales"].defunciones.sum())},
       "enla": {"n_distritos": n_enla}, "referencias": REF}
json.dump(res, open(os.path.join(OUT, "resumen.json"), "w"), ensure_ascii=False, indent=1)
print(json.dumps(res, ensure_ascii=False, indent=1))
