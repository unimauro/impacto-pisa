#!/usr/bin/env python3
"""Descarga genérica de capas ArcGIS REST (INGEMMET GEOCATMIN, OEFA PIFA, etc.).
Estrategia: paginación resultOffset si el servicio la soporta; si no, lotes de OBJECTID.
Guarda GeoJSON (WGS84) en data/raw/<nombre>.geojson con metadatos de procedencia.
"""
import json, ssl, sys, time, urllib.request, urllib.parse, datetime, os
CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE
UA = "Mozilla/5.0 (observatorio-peru ETL; contacto: github.com/unimauro)"
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.path.join(HERE, "..", "data", "raw")

def get(url, params=None, referer=None, retries=4):
    if params: url = url + "?" + urllib.parse.urlencode(params)
    h = {"User-Agent": UA}
    if referer: h["Referer"] = referer
    for i in range(retries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=180, context=CTX) as r:
                return json.loads(r.read())
        except Exception as e:
            if i == retries - 1: raise
            time.sleep(3 * (i + 1))

def fetch_layer(url, out, where="1=1", fields="*", referer=None, batch=1000):
    meta = get(url, {"f": "pjson"}, referer)
    oid = meta.get("objectIdField") or next((f["name"] for f in meta.get("fields", []) if f["type"] == "esriFieldTypeOID"), "OBJECTID")
    maxrec = meta.get("maxRecordCount", 1000) or 1000
    batch = min(batch, maxrec)
    paginate = (meta.get("advancedQueryCapabilities") or {}).get("supportsPagination", False)
    q = url + "/query"
    feats = []
    if paginate:
        off = 0
        while True:
            d = get(q, {"where": where, "outFields": fields, "returnGeometry": "true", "outSR": 4326,
                        "resultOffset": off, "resultRecordCount": batch, "f": "geojson"}, referer)
            fs = d.get("features", []); feats += fs
            print(f"  {out}: {len(feats)}", flush=True)
            if len(fs) < batch or not d.get("properties", {}).get("exceededTransferLimit", len(fs) == batch): 
                if len(fs) < batch: break
            off += batch
    else:
        ids = get(q, {"where": where, "returnIdsOnly": "true", "f": "pjson"}, referer).get("objectIds") or []
        ids.sort()
        for i in range(0, len(ids), batch):
            chunk = ids[i:i + batch]
            d = get(q, {"where": f"{oid} >= {chunk[0]} AND {oid} <= {chunk[-1]}", "outFields": fields,
                        "returnGeometry": "true", "outSR": 4326, "f": "geojson"}, referer)
            feats += d.get("features", [])
            print(f"  {out}: {len(feats)}/{len(ids)}", flush=True)
    gj = {"type": "FeatureCollection",
          "metadata": {"fuente_url": url, "capa": meta.get("name"), "descargado": datetime.datetime.now().isoformat(timespec="seconds"),
                       "where": where, "n": len(feats), "descripcion": (meta.get("description") or "")[:500]},
          "features": feats}
    os.makedirs(RAW, exist_ok=True)
    with open(os.path.join(RAW, out), "w") as f: json.dump(gj, f, ensure_ascii=False)
    print(f"OK {out}: {len(feats)} features")
    return gj

GEOCATMIN = "https://geocatmin.ingemmet.gob.pe/arcgis/rest/services/"
CAPAS = {
    "ingemmet-sedimentos.geojson": (GEOCATMIN + "SERV_GEOQUIMICA_2022/MapServer/0", "1=1",
        "ID,CODIGO,TIPO_MUESTRA,LONGITUD,LATITUD,NOMBRE_PROYECTO,N_BOLETIN,ANO_DEL_P,REGION,CUENCA,LABORATORIO,ANALISIS,AS_PPM,HG_PPB,HG_PPM,PB_PPM,CD_PPM,CU_PPM,ZN_PPM,SB_PPM,NI_PPM,CR_PPM,MN_PPM,FE_PCT,AU_PPB"),
    "ingemmet-aguas-superficiales.geojson": (GEOCATMIN + "SERV_GEOQUIMICA_2022/MapServer/5", "1=1", "*"),
    "minem-pam.geojson": (GEOCATMIN + "SERV_PASIVO_AMBIENTAL/MapServer/0", "1=1", "*"),
    "minem-reinfo.geojson": (GEOCATMIN + "SERV_REINFO/MapServer/0", "1=1",
        "OBJECTID,ID_DEPA,DEPARTAMENTO,ID_PROV,PROVINCIA,ID_DIST,DISTRITO,TIPO_ACT,ESTADO,A_INSCRIPCION,FECHA_ACTUALIZACION,COD_REINFO,LATITUD_G84,LONGITUD_G84"),
    "ingemmet-pequena-mineria.geojson": (GEOCATMIN + "SERV_PEQUENA_MINERIA/MapServer/0", "1=1", "*"),
    "ingemmet-atlas-anomalias-as.geojson": (GEOCATMIN + "SERV_ATLAS_GEOQUIMICO/MapServer/1", "1=1", "*"),
    "ingemmet-atlas-anomalias-hg.geojson": (GEOCATMIN + "SERV_ATLAS_GEOQUIMICO/MapServer/13", "1=1", "*"),
    "ingemmet-atlas-anomalias-pb.geojson": (GEOCATMIN + "SERV_ATLAS_GEOQUIMICO/MapServer/28", "1=1", "*"),
    "ingemmet-fuentes-agua.geojson": (GEOCATMIN + "SERV_HIDROGEOLOGIA_PERU/MapServer/1", "1=1", "*"),
}
if __name__ == "__main__":
    sel = sys.argv[1:] or list(CAPAS)
    for k in sel:
        url, where, fields = CAPAS[k]
        try: fetch_layer(url, k, where, fields)
        except Exception as e: print("FALLO", k, e)
