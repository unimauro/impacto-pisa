#!/usr/bin/env python3
"""Revisión automática de fuentes y datos: comprueba que cada URL del catálogo responde, corre las pruebas de calidad
y registra fecha, resultado y conteos. Salida: app/public/data/revision.json (la consume la sección 'Revisión de datos').
"""
import json, os, ssl, subprocess, datetime, urllib.request, urllib.parse, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "app", "public", "data")
CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36"
def check(url):
    url = urllib.parse.quote(url, safe=":/?=&%#+")
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(url, method=method, headers={"User-Agent": UA, "Range": "bytes=0-0"})
            with urllib.request.urlopen(req, timeout=25, context=CTX) as r: return r.status
        except urllib.error.HTTPError as e:
            if method == "GET": return e.code
        except Exception as e:
            if method == "GET": return f"error: {type(e).__name__}"
    return None
cat = json.load(open(os.path.join(OUT, "catalogo.json")))
with cf.ThreadPoolExecutor(8) as ex: estados = list(ex.map(lambda c: check(c["url"]), cat))
fuentes = [{"id": c["id"], "institucion": c["institucion"], "dataset": c["dataset"][:90], "url": c["url"], "http": s, "ok": isinstance(s, int) and s < 400} for c, s in zip(cat, estados)]
t = subprocess.run([os.path.join(HERE, "..", ".venv", "bin", "python"), "-m", "pytest", "-q", os.path.join(HERE, "..", "tests")], capture_output=True, text=True)
resumen_tests = t.stdout.strip().splitlines()[-1] if t.stdout.strip() else t.stderr[-300:]
res = json.load(open(os.path.join(OUT, "resumen.json")))
rev = {"fecha": datetime.datetime.now().isoformat(timespec="seconds"), "fuentes": fuentes, "fuentes_ok": sum(f["ok"] for f in fuentes), "fuentes_total": len(fuentes),
       "tests": {"resultado": resumen_tests, "ok": t.returncode == 0, "lista": [
           "UBIGEO de 6 dígitos, sin duplicados, 1 800–1 900 distritos", "Ausencia de dato = null, nunca 0 (sedimentos, población)", "Rangos: porcentajes 0–100, altitud −10–5 200 m, tasas < 3 000",
           "Conteos de sedimentos, REINFO, PAM y emergencias coinciden con los totales descargados", "Flags de cobertura coherentes con los datos", "JSON estricto (sin NaN/Infinity) en todas las salidas",
           "Correlaciones en [−1, 1], IC ordenados, n ≥ 30 en pares activos", "Catálogo: todas las fuentes con URL, limitaciones, estado y uso", "Sin campos de datos personales en las salidas",
           "Casos: nivel A solo con URL abierta; UBIGEO existentes"]},
       "datos_generados": res.get("generado"), "conteos": {"distritos": res.get("n_distritos"), "sedimentos": res["sedimentos"]["n"], "pam": res["pam"]["n"], "reinfo": res["reinfo"]["n"],
                                                            "emergencias": res.get("emergencias", {}).get("n"), "oefa_agua": res.get("oefa_agua", {}).get("muestras"), "defunciones": res["sinadef"]["def_total"], "enla": res["enla"]["n_distritos"]},
       "como_reportar": "https://github.com/unimauro/impacto-pisa/issues/new?template=error-de-datos.md&title=%5BDato%5D+"}
json.dump(rev, open(os.path.join(OUT, "revision.json"), "w"), ensure_ascii=False, indent=1)
print(rev["fuentes_ok"], "/", rev["fuentes_total"], "fuentes OK;", resumen_tests)
for f in fuentes:
    if not f["ok"]: print("  FALLA", f["id"], f["http"], f["url"])
