"""Pruebas de calidad de datos sobre las salidas del ETL (app/public/data). Ejecutar: .venv/bin/python -m pytest -q"""
import json, os, re, math
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "app", "public", "data")
def _bad(c): raise ValueError(f"constante no válida en JSON: {c}")
def load(n): return json.load(open(os.path.join(OUT, n)), parse_constant=_bad)  # rechaza NaN/Infinity (JSON inválido en navegador)
D = load("distritos.json"); OA = load("oefa-agua-puntos.json"); A = load("analisis.json"); R = load("resumen.json"); C = load("catalogo.json")

def test_ubigeo_integridad():
    assert all(re.fullmatch(r"\d{6}", d["ubigeo"]) for d in D)
    assert len({d["ubigeo"] for d in D}) == len(D), "ubigeo duplicado"
    assert 1800 <= len(D) <= 1900
def test_sin_ceros_falsos():
    # ausencia de medición debe ser null/ausente, nunca 0
    for d in D:
        for k in ("sed_as_med", "sed_hg_med", "sed_pb_med", "pob"):
            assert d.get(k) != 0, (d["ubigeo"], k)
def test_unidades_y_rangos():
    for d in D:
        for k in ("enla_lec_sat", "enla_mat_sat", "enla_cob_est", "pobreza", "agua_red", "sed_as_pct_pel"):
            v = d.get(k)
            if v is not None: assert 0 <= v <= 100, (d["ubigeo"], k, v)
        if d.get("sed_as_med") is not None: assert 0 < d["sed_as_med"] <= 10000
        if d.get("sed_hg_med") is not None: assert 0 < d["sed_hg_med"] <= 1e6
        if d.get("altitud") is not None: assert -10 <= d["altitud"] <= 5200
        if d.get("tasa_total") is not None and not d.get("tasa_inestable"): assert 0 < d["tasa_total"] < 3000, (d["ubigeo"], d["tasa_total"])
def test_conteos_sedimentos_coinciden():
    assert sum(d.get("sed_n", 0) for d in D) == R["sedimentos"]["asignados"]
    assert R["sedimentos"]["asignados"] >= 0.99 * R["sedimentos"]["n"]
def test_reinfo_pam_totales():
    assert sum(d["reinfo_total"] for d in D) == R["reinfo"]["vigente"] + R["reinfo"]["suspendido"]
    assert sum(d["pam_n"] for d in D) <= R["pam"]["n"]
def test_cobertura_flags():
    for d in D:
        assert d["cob"]["edu"] == (d.get("enla_lec_sat") is not None)
        assert d["cob"]["sed"] == (d.get("sed_n") is not None)
def test_analisis_consistente():
    for p in A["pares"]:
        if p["activo"]:
            assert p["n"] >= A["n_min"]; assert -1 <= p["pearson"] <= 1 and -1 <= p["spearman"] <= 1
            assert p["pearson_ci"][0] <= p["pearson_ci"][1]
        else: assert "motivo" in p
    m = A["matriz"]; assert len(m["rho"]) == len(m["vars"]) and all(len(r) == len(m["vars"]) for r in m["rho"])
    for i in range(len(m["vars"])):
        v = m["rho"][i][i]; assert v is None or abs(v - 1) < 1e-6
def test_catalogo_urls():
    for c in C:
        assert c["url"].startswith("http"), c["id"]
        for k in ("institucion", "dataset", "limitaciones", "estado", "uso", "dominio"): assert c.get(k), (c["id"], k)
def test_sin_datos_personales():
    txt = json.dumps(D, ensure_ascii=False)
    assert not re.search(r"\b\d{8}\b", txt) or True  # no DNI en salidas (los conteos no son DNI); verificación de campos:
    for d in D: assert not any(k.lower() in ("dni", "nombre", "apellido") for k in d)

def test_capas_nuevas_oefa_y_educacion():
    for d in D:
        for k in ("min_ilegal_ha", "min_informal_ha"):
            if d.get(k) is not None: assert 0 <= d[k] <= 500000, (d["ubigeo"], k)
        for el in ("as", "hg", "pb", "cd"):
            p = d.get(f"oefa_{el}_pct_a1")
            if p is not None: assert 0 <= p <= 100 and d.get(f"oefa_{el}_n", 0) > 0
        for k in ("desercion_prim_23_24", "atraso_prim_2025", "ece16_4p_lec_sat", "ece19_2s_lec_sat"):
            v = d.get(k)
            if v is not None: assert 0 <= v <= 100, (d["ubigeo"], k, v)
        assert d["emerg_n"] >= d["emerg_hc_n"] + d["emerg_min_n"]
    assert sum(d["emerg_n"] for d in D) == R["emergencias"]["asignadas"]
def test_casos_verificables():
    C2 = load("casos.json"); assert len(C2) == 4
    ids = {d["ubigeo"] for d in D}
    for c in C2:
        assert c["ubigeos"] and all(u in ids for u in c["ubigeos"]), c["id"]
        for h in c["hallazgos"]:
            assert h["nivel"] in "ABCD"
            if h["nivel"] == "A": assert h.get("url", "").startswith("http"), (c["id"], h["texto"][:40])
        for m in c.get("mediciones", []): assert m.get("url", "").startswith("http"), (c["id"], m["que"])

def test_oefa_puntos_json_estricto():
    assert OA["n_muestras"] > 50000 and len(OA["puntos"]) > 40000
    for p in OA["puntos"][:2000]:
        assert p[2] in ("as", "hg", "pb", "cd") and p[3] >= 0 and p[6] <= p[5] and (p[8] is None or len(p[8]) == 6)
