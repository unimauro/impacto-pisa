#!/usr/bin/env python3
"""PISA: serie del Perú 2000–2025 (UMC-MINEDU, Resultados-PISA-Perú.xls) + tabla de países (data/raw/pisa-paises.csv, OCDE, si existe).
Salida: app/public/data/pisa.json. Se conservan errores estándar y desagregación por sexo y gestión.
"""
import pandas as pd, json, os, math
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.path.join(HERE, "..", "data", "raw"); OUT = os.path.join(HERE, "..", "app", "public", "data")
x = pd.ExcelFile(os.path.join(RAW, "umc-pisa-peru.xls"))
AREAS = {"lectura": "Lectura", "matematica": "Matemática", "ciencias": "Ciencia"}
GRUPOS = ["nacional", "hombre", "mujer", "estatal", "no_estatal"]
def num(v):
    try: f = float(v); return None if math.isnan(f) else round(f, 1)
    except: return None
serie = {}   # anio -> area -> {medida:{grupo:val}, ee:{grupo}, niveles:{nivel:{grupo:val}}}
for area, hoja in AREAS.items():
    d = x.parse(f"{hoja}_Medida", header=None)
    for i in range(4, len(d)):
        r = d.iloc[i].tolist(); anio = num(r[1]); tipo = str(r[2]).strip().lower()
        if anio is None: continue
        y = serie.setdefault(int(anio), {}); a = y.setdefault(area, {"medida": {}, "ee": {}, "niveles": {}})
        vals = {g: num(r[3 + k]) for k, g in enumerate(GRUPOS)}
        if tipo.startswith("medida"): a["medida"] = vals
        elif tipo.startswith("e.e"): a["ee"] = vals
    d = x.parse(f"{hoja}_Nivel", header=None); anio_act = None
    for i in range(4, len(d)):
        r = d.iloc[i].tolist()
        if num(r[1]) is not None: anio_act = int(num(r[1]))
        nivel = str(r[2]).strip(); tipo = str(r[3]).strip().lower()
        if anio_act is None or nivel in ("nan", "") or tipo != "%": continue
        a = serie.setdefault(anio_act, {}).setdefault(area, {"medida": {}, "ee": {}, "niveles": {}})
        a["niveles"][nivel] = {g: num(r[4 + k]) for k, g in enumerate(GRUPOS)}
# % bajo nivel 2 = Debajo de Nivel 1 (+ Nivel 1a/1b/1c si existen) + Nivel 1
peru = []
for anio in sorted(serie):
    row = {"anio": anio}
    for area in AREAS:
        a = serie[anio].get(area)
        if not a: continue
        row[area] = a["medida"].get("nacional"); row[f"{area}_ee"] = a["ee"].get("nacional")
        row[f"{area}_hombre"] = a["medida"].get("hombre"); row[f"{area}_mujer"] = a["medida"].get("mujer"); row[f"{area}_estatal"] = a["medida"].get("estatal"); row[f"{area}_no_estatal"] = a["medida"].get("no_estatal")
        bajo = 0.0; ok = False
        for niv, v in a["niveles"].items():
            n = niv.lower()
            if n.startswith("debajo") or n.startswith("nivel 1"):
                if v.get("nacional") is not None: bajo += v["nacional"]; ok = True
        row[f"{area}_bajo_nivel2"] = round(bajo, 1) if ok else None
        row[f"{area}_niveles"] = a["niveles"]
    peru.append(row)
paises = []
fn = os.path.join(RAW, "pisa-paises.csv")
if os.path.exists(fn):
    p = pd.read_csv(fn, dtype=str)
    for r in p.itertuples(index=False):
        paises.append({"anio": int(r.anio), "pais": r.pais, "iso3": r.codigo_iso3, "matematica": num(r.matematica), "lectura": num(r.lectura), "ciencias": num(r.ciencias), "fuente": r.fuente_url})
out = {"fuente_peru": "UMC-MINEDU, Resultados PISA Perú (http://umc.minedu.gob.pe/wp-content/uploads/2026/09/Resultados-PISA-Perú.xls)", "fuente_paises": "OCDE, PISA 2022 Results Volume I (ver fuente por fila)",
       "nota": "PISA es una muestra nacional representativa de estudiantes de 15 años (2022: 6 968 estudiantes en 337 escuelas, 86,3 % de los adolescentes de 15 años). No es representativa por región ni por distrito; aquí se usa solo como contexto nacional e internacional.",
       "peru": peru, "paises": paises}
json.dump(out, open(os.path.join(OUT, "pisa.json"), "w"), ensure_ascii=False, allow_nan=False)
for r in peru: print(r["anio"], {a: (r.get(a), r.get(f"{a}_bajo_nivel2")) for a in AREAS})
print("paises", len(paises))
