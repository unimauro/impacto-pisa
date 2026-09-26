#!/usr/bin/env python3
"""Análisis multifactorial de los resultados educativos y sanitarios a nivel distrital.
Para cada resultado: OLS con todas las variables candidatas (socioeconómicas + ambientales) estandarizadas,
coeficientes beta estandarizados con IC 95 % (HC3), R² total, y contribución única de cada variable
(semi-parcial: caída de R² al quitarla). También correlación bivariada de Spearman de cada variable con el resultado.
Salida: app/public/data/factores.json. Advertencia: asociaciones ecológicas, no causales; las variables ambientales
solo existen en subconjuntos de distritos (se ajusta sobre el subconjunto con datos completos y se reporta n).
"""
import json, os, math, numpy as np, pandas as pd, statsmodels.api as sm
from scipy import stats
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "app", "public", "data")
df = pd.DataFrame(json.load(open(os.path.join(OUT, "distritos.json"))))
df["log_pob"] = np.log10(df["pob"].where(df["pob"] > 0))
df["log_sed_as_med"] = np.log10(df["sed_as_med"].where((df["sed_as_med"] > 0) & (df["sed_as_n"].fillna(0) >= 3)))
df["log_sed_pb_med"] = np.log10(df["sed_pb_med"].where((df["sed_pb_med"] > 0) & (df["sed_pb_n"].fillna(0) >= 3)))
df["reinfo_por_10k"] = df["reinfo_total"] / df["pob"] * 1e4
df["pam_por_10k"] = df["pam_n"] / df["pob"] * 1e4
df["log_min_ilegal_ha"] = np.log10(df["min_ilegal_ha"].fillna(0) + 1)
df["emerg_por_10k"] = df["emerg_n"].fillna(0) / df["pob"] * 1e4
df["gasto_pc_log"] = np.log10(df["gasto_dev_pc_2025"].where(df["gasto_dev_pc_2025"] > 0))
L = {"pobreza": "Pobreza monetaria (%)", "altitud": "Altitud (m)", "log_pob": "Población (log10)", "agua_red": "Viviendas con agua de red (%)", "desague_red": "Con desagüe de red (%)",
     "internet": "Hogares con internet (%)", "electricidad": "Con electricidad (%)", "idh": "IDH 2019", "vuln_alim": "Vulnerabilidad alimentaria", "gasto_pc_log": "Gasto público por habitante (log10)",
     "reinfo_por_10k": "REINFO por 10 mil hab.", "pam_por_10k": "Pasivos mineros por 10 mil hab.", "log_min_ilegal_ha": "Minería ilegal (log10 ha)", "emerg_por_10k": "Emergencias OEFA por 10 mil hab.",
     "log_sed_as_med": "Arsénico en sedimentos (log10 ppm)", "log_sed_pb_med": "Plomo en sedimentos (log10 ppm)", "oefa_as_pct_a1": "Agua: % As > ECA A1", "um_n": "Unidades mineras formales",
     "desercion_prim_23_24": "Deserción primaria (%)", "atraso_prim_2025": "Atraso escolar primaria (%)", "enla_cob_est": "Cobertura ENLA (%)"}
SOCIO = ["pobreza", "altitud", "log_pob", "agua_red", "desague_red", "internet", "electricidad", "gasto_pc_log"]
AMB_ALL = ["reinfo_por_10k", "pam_por_10k", "log_min_ilegal_ha", "emerg_por_10k", "um_n"]   # disponibles en todos los distritos (0 = sin registro)
AMB_SUB = ["log_sed_as_med", "log_sed_pb_med"]                                              # solo distritos muestreados
RES = {"enla_lec_sat": "ENLA 2024 lectura: % satisfactorio (4.º primaria)", "enla_mat_sat": "ENLA 2024 matemática: % satisfactorio", "enla_lec_prev": "ENLA 2024 lectura: % previo al inicio",
       "desercion_prim_23_24": "Deserción interanual primaria 2023→2024 (%)", "tasa_renal": "Mortalidad renal por 100 mil", "tasa_cancer": "Mortalidad por cáncer por 100 mil", "tasa_total": "Mortalidad total por 100 mil"}

def modelo(y, X, d):
    Z = (d[X] - d[X].mean()) / d[X].std(); Zy = (d[y] - d[y].mean()) / d[y].std()
    m = sm.OLS(Zy, sm.add_constant(Z)).fit(cov_type="HC3"); r2 = float(m.rsquared)
    coef = []
    for x in X:
        Xr = [k for k in X if k != x]; mr = sm.OLS(Zy, sm.add_constant(Z[Xr])).fit(); ci = m.conf_int().loc[x]
        rho, p = stats.spearmanr(d[x], d[y])
        coef.append({"var": x, "label": L[x], "beta": round(float(m.params[x]), 3), "ci": [round(float(ci[0]), 3), round(float(ci[1]), 3)], "p": float(m.pvalues[x]),
                     "r2_unico": round(r2 - float(mr.rsquared), 4), "spearman": round(float(rho), 3), "spearman_p": float(p), "tipo": "socio" if x in SOCIO else "ambiente"})
    coef.sort(key=lambda c: -abs(c["beta"]))
    return {"n": int(m.nobs), "r2": round(r2, 3), "r2_adj": round(float(m.rsquared_adj), 3), "coef": coef}
out = {"resultados": [], "nota": "Betas estandarizados: cambio en desviaciones estándar del resultado por 1 DE de la variable, con las demás fijas. r2_unico = R² que se pierde al quitar la variable (contribución única). Asociaciones distritales, no causales."}
for y, lab in RES.items():
    X_all = SOCIO + AMB_ALL
    cols = [y] + X_all + ["pob"]; d = df[cols].dropna()
    if y.startswith("tasa_"): d = d[d["pob"] >= 5000]
    d = d[[c for c in d.columns if c != "pob"]]
    d = d.loc[:, d.std() > 0]; X_use = [x for x in X_all if x in d.columns]
    item = {"y": y, "label": lab, "modelo_todos": modelo(y, X_use, d)}
    # modelo solo socioeconómico y ganancia por añadir ambiente
    ms = modelo(y, [x for x in SOCIO if x in d.columns], d); item["r2_socio"] = ms["r2"]; item["ganancia_ambiente"] = round(item["modelo_todos"]["r2"] - ms["r2"], 4)
    # subconjunto con sedimentos
    cols2 = [y] + X_all + AMB_SUB + ["pob"]; d2 = df[cols2].dropna()
    if y.startswith("tasa_"): d2 = d2[d2["pob"] >= 5000]
    d2 = d2[[c for c in d2.columns if c != "pob"]]; d2 = d2.loc[:, d2.std() > 0]
    if len(d2) >= 60:
        X2 = [x for x in X_all + AMB_SUB if x in d2.columns]; item["modelo_sedimentos"] = modelo(y, X2, d2)
    out["resultados"].append(item)
    print(f"{y:22s} n={item['modelo_todos']['n']:4d} R²={item['modelo_todos']['r2']:.2f} (socio {ms['r2']:.2f}, +amb {item['ganancia_ambiente']:+.3f}) top: " + ", ".join(f"{c['var']} {c['beta']:+.2f}" for c in item["modelo_todos"]["coef"][:4]))
def clean(o):
    if isinstance(o, float): return None if (math.isnan(o) or math.isinf(o)) else o
    if isinstance(o, dict): return {k: clean(v) for k, v in o.items()}
    if isinstance(o, list): return [clean(v) for v in o]
    return o
json.dump(clean(out), open(os.path.join(OUT, "factores.json"), "w"), ensure_ascii=False, allow_nan=False)
