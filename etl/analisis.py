#!/usr/bin/env python3
"""Motor de análisis reproducible: correlaciones (Pearson/Spearman con IC bootstrap), correlaciones parciales
y regresiones multivariables (OLS con errores robustos HC3) entre variables AMBIENTALES y de EDUCACIÓN/SALUD a nivel distrital.
Salida: app/public/data/analisis.json. Cada resultado lleva n, cobertura y advertencias. Si n < N_MIN el análisis se desactiva.
ADVERTENCIA: unidad de análisis = distrito (ecológica). Una asociación distrital NO implica que los individuos expuestos
sean los que presentan el resultado (falacia ecológica). Nada aquí demuestra causalidad.
"""
import json, os, math, numpy as np, pandas as pd
from scipy import stats
import statsmodels.api as sm
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "app", "public", "data")
N_MIN = 30; rng = np.random.default_rng(42)
df = pd.DataFrame(json.load(open(os.path.join(OUT, "distritos.json"))))
df["log_pob"] = np.log10(df["pob"].where(df["pob"] > 0))
df["reinfo_por_10k"] = df["reinfo_total"] / df["pob"] * 1e4
df["pam_por_10k"] = df["pam_n"] / df["pob"] * 1e4
df["reinfo_vig_por_10k"] = df["reinfo_vigente"] / df["pob"] * 1e4
df["log_sed_as_med"] = np.log10(df["sed_as_med"].where(df["sed_as_med"] > 0))
df["log_sed_hg_med"] = np.log10(df["sed_hg_med"].where(df["sed_hg_med"] > 0))
df["log_sed_pb_med"] = np.log10(df["sed_pb_med"].where(df["sed_pb_med"] > 0))
df["log_sed_cd_med"] = np.log10(df["sed_cd_med"].where(df["sed_cd_med"] > 0))
df["log_min_ilegal_ha"] = np.log10(df["min_ilegal_ha"].fillna(0) + 1) if "min_ilegal_ha" in df else np.nan
df["log_min_informal_ha"] = np.log10(df["min_informal_ha"].fillna(0) + 1) if "min_informal_ha" in df else np.nan
df["emerg_por_10k"] = df["emerg_n"].fillna(0) / df["pob"] * 1e4 if "emerg_n" in df else np.nan
for c in ("oefa_as_pct_a1", "oefa_hg_pct_a1", "oefa_pb_pct_a1"):
    if c not in df: df[c] = np.nan
df["delta_enla_lec_16_24"] = df["enla_lec_sat"] - df["ece16_4p_lec_sat"] if "ece16_4p_lec_sat" in df else np.nan
# Distritos con ≥3 muestras de sedimento para la mediana (evita medianas de n=1)
for el in ("as", "hg", "pb", "cd"):
    df.loc[df[f"sed_{el}_n"].fillna(0) < 3, [f"log_sed_{el}_med", f"sed_{el}_med", f"sed_{el}_pct_pel"]] = np.nan
AMB = {
    "log_sed_as_med": {"label": "Arsénico en sedimentos (mediana, log10 ppm)", "fuente": "INGEMMET Geoquímica 2000–2018", "tipo": "geoquímico (contexto natural + antrópico)"},
    "sed_as_pct_pel": {"label": "% muestras As > 17 ppm (PEL)", "fuente": "INGEMMET", "tipo": "geoquímico"},
    "log_sed_hg_med": {"label": "Mercurio en sedimentos (mediana, log10 ppb)", "fuente": "INGEMMET", "tipo": "geoquímico"},
    "log_sed_pb_med": {"label": "Plomo en sedimentos (mediana, log10 ppm)", "fuente": "INGEMMET", "tipo": "geoquímico"},
    "log_sed_cd_med": {"label": "Cadmio en sedimentos (mediana, log10 ppm)", "fuente": "INGEMMET", "tipo": "geoquímico"},
    "reinfo_por_10k": {"label": "Registros REINFO por 10 mil hab.", "fuente": "MINEM REINFO (feb-2025)", "tipo": "minería informal/en formalización (NO = ilegal)"},
    "reinfo_vig_por_10k": {"label": "REINFO vigentes por 10 mil hab.", "fuente": "MINEM", "tipo": "minería en formalización"},
    "pam_por_10k": {"label": "Pasivos ambientales mineros por 10 mil hab.", "fuente": "MINEM Inventario PAM", "tipo": "minería histórica"},
    "um_n": {"label": "Unidades mineras formales (n)", "fuente": "MINEM/OSINERGMIN", "tipo": "minería formal"},
    "log_min_ilegal_ha": {"label": "Área de minería ilegal (log10 ha+1)", "fuente": "OEFA PIFA (UFAFEMA/GORE/REINFO excluido)", "tipo": "minería ilegal documentada"},
    "log_min_informal_ha": {"label": "Área de minería informal (log10 ha+1)", "fuente": "OEFA PIFA (REINFO)", "tipo": "minería informal"},
    "emerg_por_10k": {"label": "Emergencias ambientales OEFA por 10 mil hab.", "fuente": "OEFA ODES", "tipo": "derrames y emergencias"},
    "oefa_as_pct_a1": {"label": "% muestras de agua con As > ECA A1 (0,01 mg/L)", "fuente": "OEFA monitoreo agua superficial 2014–2026", "tipo": "calidad de agua superficial medida"},
    "oefa_hg_pct_a1": {"label": "% muestras de agua con Hg > ECA A1 (0,001 mg/L)", "fuente": "OEFA", "tipo": "calidad de agua superficial medida"},
    "oefa_pb_pct_a1": {"label": "% muestras de agua con Pb > ECA A1 (0,01 mg/L)", "fuente": "OEFA", "tipo": "calidad de agua superficial medida"},
}
RES = {
    "enla_lec_sat": {"label": "ENLA 2024 lectura: % satisfactorio (4º prim.)", "fuente": "UMC-MINEDU", "dominio": "educación"},
    "enla_mat_sat": {"label": "ENLA 2024 matemática: % satisfactorio (4º prim.)", "fuente": "UMC-MINEDU", "dominio": "educación"},
    "enla_lec_prev": {"label": "ENLA 2024 lectura: % previo al inicio", "fuente": "UMC-MINEDU", "dominio": "educación"},
    "enla_mat_prev": {"label": "ENLA 2024 matemática: % previo al inicio", "fuente": "UMC-MINEDU", "dominio": "educación"},
    "tasa_renal": {"label": "Mortalidad renal (N17–N19) por 100 mil hab-año", "fuente": "SINADEF 2019–2025", "dominio": "salud"},
    "tasa_hepatica": {"label": "Mortalidad hepática (K70–K77) por 100 mil", "fuente": "SINADEF 2019–2025", "dominio": "salud"},
    "tasa_cancer": {"label": "Mortalidad por cáncer (C00–D09) por 100 mil", "fuente": "SINADEF 2019–2025", "dominio": "salud"},
    "tasa_cancer_piel": {"label": "Mortalidad cáncer de piel (C43–C44) por 100 mil", "fuente": "SINADEF", "dominio": "salud"},
    "tasa_cancer_vejiga_rinon": {"label": "Mortalidad cáncer vejiga/riñón (C64–C68) por 100 mil", "fuente": "SINADEF", "dominio": "salud"},
    "tasa_neuro": {"label": "Mortalidad enf. sistema nervioso (G) por 100 mil", "fuente": "SINADEF", "dominio": "salud"},
    "tasa_perinatal_congenita": {"label": "Mortalidad perinatal/congénita (P,Q) por 100 mil", "fuente": "SINADEF", "dominio": "salud"},
    "tasa_total": {"label": "Mortalidad total registrada por 100 mil", "fuente": "SINADEF", "dominio": "salud"},
    "ece19_2s_lec_sat": {"label": "ECE 2019 lectura 2.º sec.: % satisfactorio", "fuente": "UMC-MINEDU", "dominio": "educación"},
    "ece19_2s_mat_sat": {"label": "ECE 2019 matemática 2.º sec.: % satisfactorio", "fuente": "UMC-MINEDU", "dominio": "educación"},
    "desercion_prim_23_24": {"label": "Deserción interanual primaria 2023→2024 (%)", "fuente": "ESCALE-SIAGIE", "dominio": "educación"},
    "atraso_prim_2025": {"label": "Atraso escolar primaria 2025 (%)", "fuente": "ESCALE-SIAGIE", "dominio": "educación"},
    "delta_enla_lec_16_24": {"label": "Cambio en % satisfactorio lectura 4.º prim. 2016→2024 (pp)", "fuente": "UMC (ECE 2016, ENLA 2024)", "dominio": "educación"},
}
CTRL = ["pobreza", "altitud", "log_pob", "agua_red", "internet"]
CTRL_LABEL = {"pobreza": "pobreza monetaria (%)", "altitud": "altitud (m)", "log_pob": "log población", "agua_red": "% viviendas con agua de red", "internet": "% hogares con internet"}

def boot_ci(x, y, fn, B=1000):
    n = len(x); vals = []
    for _ in range(B):
        i = rng.integers(0, n, n); vals.append(fn(x[i], y[i]))
    return [round(float(np.nanpercentile(vals, 2.5)), 3), round(float(np.nanpercentile(vals, 97.5)), 3)]
def partial_corr(d, x, y, ctrl):
    Z = sm.add_constant(d[ctrl]); rx = d[x] - sm.OLS(d[x], Z).fit().fittedvalues; ry = d[y] - sm.OLS(d[y], Z).fit().fittedvalues
    r, p = stats.pearsonr(rx, ry); return round(float(r), 3), float(p)
pares = []
for a, am in AMB.items():
    for r, rm in RES.items():
        # para tasas de mortalidad: solo distritos con población ≥ 5 000 (tasas estables)
        d = df[[a, r] + CTRL + ["pob", "departamento"]].dropna()
        if r.startswith("tasa_"): d = d[d["pob"] >= 5000]
        n = len(d); item = {"x": a, "y": r, "n": n, "x_label": am["label"], "y_label": rm["label"], "x_fuente": am["fuente"], "y_fuente": rm["fuente"], "x_tipo": am["tipo"], "dominio": rm["dominio"]}
        if n < N_MIN:
            item["activo"] = False; item["motivo"] = f"n={n} < {N_MIN} distritos con ambas variables"; pares.append(item); continue
        x, y = d[a].to_numpy(float), d[r].to_numpy(float)
        pr, pp = stats.pearsonr(x, y); sr, sp = stats.spearmanr(x, y)
        item.update({"activo": True, "pearson": round(float(pr), 3), "pearson_p": float(pp), "pearson_ci": boot_ci(x, y, lambda u, v: stats.pearsonr(u, v)[0]),
                     "spearman": round(float(sr), 3), "spearman_p": float(sp), "spearman_ci": boot_ci(x, y, lambda u, v: stats.spearmanr(u, v)[0], 500)})
        ctrl_ok = [c for c in CTRL if d[c].notna().all() and d[c].std() > 0]
        if len(d) >= N_MIN + len(ctrl_ok):
            prc, prp = partial_corr(d, a, r, ctrl_ok); item["parcial"] = prc; item["parcial_p"] = prp; item["parcial_ctrl"] = [CTRL_LABEL[c] for c in ctrl_ok]
            X = sm.add_constant(d[[a] + ctrl_ok]); m = sm.OLS(d[r], X).fit(cov_type="HC3")
            item["ols"] = {"beta": round(float(m.params[a]), 4), "se": round(float(m.bse[a]), 4), "p": float(m.pvalues[a]), "r2": round(float(m.rsquared), 3),
                           "ci": [round(float(v), 4) for v in m.conf_int().loc[a]], "n": int(m.nobs),
                           "coef": {k: round(float(v), 4) for k, v in m.params.items()}}
        # por departamento (solo con n≥15) para ver heterogeneidad
        dep = []
        for g, sub in d.groupby("departamento"):
            if len(sub) >= 15:
                rr, ppv = stats.spearmanr(sub[a], sub[r]); dep.append({"dep": g, "n": len(sub), "spearman": round(float(rr), 2), "p": float(ppv)})
        item["por_departamento"] = dep
        pares.append(item)
# Matriz de correlación de Spearman entre todas las variables (pairwise)
VARS = list(AMB) + list(RES) + CTRL
sub = df[VARS]; mat = sub.corr(method="spearman", min_periods=N_MIN)
nmat = sub.notna().astype(int).T.dot(sub.notna().astype(int))
matriz = {"vars": VARS, "labels": {**{k: v["label"] for k, v in AMB.items()}, **{k: v["label"] for k, v in RES.items()}, **CTRL_LABEL},
          "rho": [[None if (isinstance(v, float) and math.isnan(v)) else round(float(v), 2) for v in row] for row in mat.values.tolist()],
          "n": nmat.values.tolist()}
# Descriptivos por variable
desc = {}
for v in VARS:
    s = df[v].dropna()
    if len(s): desc[v] = {"n": int(len(s)), "media": round(float(s.mean()), 3), "mediana": round(float(s.median()), 3), "p10": round(float(s.quantile(.1)), 3), "p90": round(float(s.quantile(.9)), 3), "min": round(float(s.min()), 3), "max": round(float(s.max()), 3)}
out = {"n_min": N_MIN, "controles": CTRL_LABEL, "pares": pares, "matriz": matriz, "descriptivos": desc,
       "advertencias": [
           "Unidad de análisis: distrito (datos agregados). Toda asociación es ecológica: no describe a individuos (falacia ecológica).",
           "La geoquímica de sedimentos (INGEMMET) caracteriza el contexto natural y antrópico de la cuenca; NO mide el agua que bebe la población.",
           "REINFO registra mineros en proceso de formalización; no es prueba de minería ilegal ni de contaminación.",
           "Las tasas de mortalidad son crudas (sin estandarizar por edad) y provienen de un registro con subregistro variable por distrito.",
           "ENLA 2024 es censal (4º primaria) pero la cobertura por distrito varía (ver enla_cob_est); las estimaciones en distritos con baja cobertura son menos fiables.",
           "Correlación no implica causalidad. Los controles disponibles (pobreza, altitud, población, agua, internet) no agotan los factores de confusión (nutrición, acceso sanitario, ruralidad).",
           "Rezagos: sedimentos 2000–2018 vs. resultados 2019–2025; no se modelan rezagos individuales."]}
def _clean(o):
    if isinstance(o, float): return None if (math.isnan(o) or math.isinf(o)) else o
    if isinstance(o, dict): return {k: _clean(v) for k, v in o.items()}
    if isinstance(o, list): return [_clean(v) for v in o]
    return o
json.dump(_clean(out), open(os.path.join(OUT, "analisis.json"), "w"), ensure_ascii=False, allow_nan=False)
act = [p for p in pares if p["activo"]]
print("pares activos", len(act), "/", len(pares))
for p in sorted(act, key=lambda p: -abs(p.get("parcial") or 0))[:15]:
    print(f"{p['x']:22s} {p['y']:26s} n={p['n']:4d} r={p['pearson']:+.2f} rho={p['spearman']:+.2f} parcial={p.get('parcial')} p={p.get('parcial_p', 1):.3g}")
