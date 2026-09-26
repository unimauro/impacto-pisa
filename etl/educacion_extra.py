#!/usr/bin/env python3
"""Educación complementaria por distrito (UMC-MINEDU y ESCALE):
 - ECE 2016 y 2018, 4.º primaria (misma serie que ENLA 2024): % satisfactorio lectura/matemática, cobertura estudiantes.
 - ECE 2019, 2.º secundaria (último dato distrital de secundaria): % satisfactorio lectura/matemática.
 - ESCALE tendencias: tasa de deserción interanual primaria (idCuadro 319) 2023-2024 y atraso escolar primaria (idCuadro 14) 2025.
Salida: data/processed/educacion_extra.csv (ubigeo + columnas). Distritos ocultos por baja cobertura ('-') quedan nulos.
"""
import pandas as pd, os
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.path.join(HERE, "..", "data", "raw"); PROC = os.path.join(HERE, "..", "data", "processed")
def num(v):
    try: x = float(str(v).replace(",", ".")); return x
    except: return None
def umc(path, sheet, tag, hdr_row=3):
    d = pd.read_excel(path, sheet_name=sheet, header=None, dtype=str)
    rows = d.iloc[hdr_row + 1:]
    out = {}
    for r in rows.itertuples(index=False):
        cod = str(r[0]).strip().zfill(6) if str(r[0]).strip().isdigit() else None
        if not cod: continue
        out[cod] = {f"{tag}_cob_est": num(r[5]), f"{tag}_lec_sat": num(r[9]), f"{tag}_mat_sat": num(r[13]), f"{tag}_lec_prev": num(r[6])}
    return pd.DataFrame.from_dict(out, orient="index")
def escale(path, tag, col_label):
    d = pd.read_excel(path, sheet_name="Distrital", header=None, dtype=str)
    hdr = d.iloc[5].tolist(); ci = [i for i, h in enumerate(hdr) if str(h).strip().startswith(col_label)][0]
    out = {}
    for r in d.iloc[6:].itertuples(index=False):
        cod = str(r[1]).strip()
        if cod.isdigit() and len(cod) == 6: out[cod] = {tag: num(r[ci])}
    return pd.DataFrame.from_dict(out, orient="index")
parts = [
    umc(os.path.join(RAW, "umc-4p-distrital-2016-2018-2024.xlsx"), "Distrital ECE  2016 4P", "ece16_4p"),
    umc(os.path.join(RAW, "umc-4p-distrital-2016-2018-2024.xlsx"), "Distrital ECE  2018 4P", "ece18_4p"),
    umc(os.path.join(RAW, "umc-2s-distrital-2015-2019.xlsx"), "Distrito_2019", "ece19_2s"),
    escale(os.path.join(RAW, "escale-tendencia-319.xls"), "desercion_prim_23_24", "2023-2024"),
    escale(os.path.join(RAW, "escale-tendencia-14.xls"), "atraso_prim_2025", "2025"),
]
df = pd.concat(parts, axis=1); df.index.name = "ubigeo"
df.to_csv(os.path.join(PROC, "educacion_extra.csv"))
print(df.describe().T[["count", "mean", "50%", "max"]])
