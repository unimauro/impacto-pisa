#!/usr/bin/env python3
"""Agrega la microdata SINADEF (MINSA Datos Abiertos) a nivel DISTRITO de domicilio × año × grupo de causa.
Entrada: CSV crudo ya descargado por el repo mortalidad-peru (files.minsa.gob.pe/s/RjeWiJt2wX3pMdG).
Salida: data/processed/sinadef_distrital.csv  (ubigeo, anio, grupo, defunciones)
Regla: causa básica = último código CIE-10 no vacío de la cadena A→F (misma aproximación que mortalidad-peru).
Sin datos individuales: solo conteos. Celdas < 5 se marcan en el frontend, no aquí.
"""
import pandas as pd, re, os, sys
SRC = sys.argv[1] if len(sys.argv) > 1 else "/Users/unimauro/Repos/mortalidad-peru/data/raw/SINADEF_DATOS_ABIERTOS.csv"
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "sinadef_distrital.csv")
GRUPOS = [  # (nombre, regex sobre el código CIE-10 de causa básica)
    ("renal", r"^N1[7-9]"),                 # insuficiencia renal aguda/crónica/no especificada
    ("hepatica", r"^K7[0-7]"),              # enfermedades del hígado
    ("cancer", r"^C|^D0"),                  # tumores malignos + in situ
    ("cancer_piel", r"^C4[34]"),
    ("cancer_vejiga_rinon", r"^C6[4-8]"),
    ("cancer_pulmon", r"^C3[34]"),
    ("intox_metales", r"^T56"),             # efecto tóxico de metales
    ("intox_plaguicidas", r"^T60"),
    ("dermatologica", r"^L"),
    ("neuro", r"^G"),
    ("perinatal_congenita", r"^P|^Q"),
    ("cardiovascular", r"^I"),
    ("respiratoria", r"^J"),
    ("externas", r"^[VWXY]"),
]
import json, unicodedata
def norm(s):
    s = unicodedata.normalize("NFKD", str(s or "")).encode("ascii", "ignore").decode().upper().strip()
    return re.sub(r"[^A-Z0-9 ]", "", re.sub(r"\s+", " ", s))
# El campo COD_UBIGEO_DOMICILIO de SINADEF usa la codificación RENIEC (p.ej. Cusco=07, Huancavelica=08), NO el UBIGEO INEI.
# Por eso el cruce se hace por NOMBRES (dep/prov/dist) contra el geojson distrital (INEI/IDDIST).
GJ = json.load(open(os.path.join(os.path.dirname(__file__), "..", "data", "raw", "peru-distrital.geojson")))
LOOK = {}
for f in GJ["features"]:
    p = f["properties"]
    LOOK[(norm(p["NOMBDEP"]), norm(p["NOMBPROV"]), norm(p["NOMBDIST"]))] = p["IDDIST"]
ALIAS_DEP = {"LIMA METROPOLITANA": "LIMA", "LIMA REGION": "LIMA", "PROV CONST DEL CALLAO": "CALLAO", "PROV. CONST. DEL CALLAO": "CALLAO"}
def ubigeo_nombres(dep, prov, dis):
    d, p, s = norm(dep), norm(prov), norm(dis)
    d = ALIAS_DEP.get(d, d)
    return LOOK.get((d, p, s)) or LOOK.get((d, p, s.replace("SANTA MARIA DEL MAR", "SANTA MARIA DEL MAR")))
acc = {}
import collections
NOMATCH = collections.Counter()
cols = ["COD_UBIGEO_DOMICILIO", "PAIS_DOMICILIO", "DEPARTAMENTO_DOMICILIO", "PROVINCIA_DOMICILIO", "DISTRITO_DOMICILIO", "ANIO", "SEXO", "EDAD", "TIEMPO_EDAD"] + [f"CAUSA_{c}_CIEX" for c in "ABCDEF"]
for chunk in pd.read_csv(SRC, usecols=cols, dtype=str, chunksize=300_000, sep=",", encoding="utf-8", on_bad_lines="skip"):
    chunk = chunk[chunk["PAIS_DOMICILIO"].str.upper().eq("PERU")]
    chunk["ubigeo"] = [ubigeo_nombres(a, b, c) for a, b, c in zip(chunk["DEPARTAMENTO_DOMICILIO"], chunk["PROVINCIA_DOMICILIO"], chunk["DISTRITO_DOMICILIO"])]
    NOMATCH.update(collections.Counter((a, b, c) for a, b, c, u in zip(chunk["DEPARTAMENTO_DOMICILIO"], chunk["PROVINCIA_DOMICILIO"], chunk["DISTRITO_DOMICILIO"], chunk["ubigeo"]) if u is None))
    chunk = chunk.dropna(subset=["ubigeo"])
    causas = chunk[[f"CAUSA_{c}_CIEX" for c in "ABCDEF"]].replace({"SIN REGISTRO": None, "": None})
    basica = None
    for c in "FEDCBA":
        col = causas[f"CAUSA_{c}_CIEX"]
        basica = col if basica is None else basica.fillna(col)
    chunk["basica"] = basica.fillna("").str.upper().str.strip()
    edad = pd.to_numeric(chunk["EDAD"], errors="coerce")
    anios = chunk["TIEMPO_EDAD"].str.upper().str.startswith("A")
    chunk["menor5"] = (~anios) | (edad < 5)
    for g, rx in GRUPOS + [("total", r".")]:
        m = chunk["basica"].str.contains(rx, regex=True, na=False) if g != "total" else pd.Series(True, index=chunk.index)
        sub = chunk[m]
        for (u, a), n in sub.groupby(["ubigeo", "ANIO"]).size().items():
            acc[(u, a, g)] = acc.get((u, a, g), 0) + int(n)
        if g == "total":
            for (u, a), n in sub[sub["menor5"]].groupby(["ubigeo", "ANIO"]).size().items():
                acc[(u, a, "total_menor5")] = acc.get((u, a, "total_menor5"), 0) + int(n)
    print("chunk", len(chunk), flush=True)
df = pd.DataFrame([(u, a, g, n) for (u, a, g), n in acc.items()], columns=["ubigeo", "anio", "grupo", "defunciones"])
df.sort_values(["ubigeo", "anio", "grupo"]).to_csv(OUT, index=False)
print("OK", OUT, len(df))
print("SIN MATCH (top 40):", NOMATCH.most_common(40), "total sin match:", sum(NOMATCH.values()))
