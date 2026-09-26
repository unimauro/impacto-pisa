# Informe verificado: fuentes ambientales y mineras (Perú) — 25-sep-2026

Método: cada URL fue consultada por curl/WebFetch desde esta máquina hoy. "Verificado" = respondió y se inspeccionaron campos/conteos. Los conteos son `returnCountOnly=true` de hoy.

## 1. INGEMMET / GEOCATMIN (ArcGIS REST 10.9.1) — VERIFICADO
Base: `https://geocatmin.ingemmet.gob.pe/arcgis/rest/services` (77 servicios raíz, 16 carpetas). Formatos: JSON, geoJSON, PBF. **Gotcha:** el servidor responde "Pagination is not supported" a `resultOffset/resultRecordCount`; paginar por rangos de OBJECTID (`where=OBJECTID>=1 AND OBJECTID<2001`) o por filtro (REGION, DEPA). maxRecordCount 1000–2000.

| Capa | URL (añadir `?f=pjson`) | Geom / n | Campos clave | Unidad territorial | Años | Limitaciones |
|---|---|---|---|---|---|---|
| Sedimentos de quebrada (programa geoquímica nacional) | `.../SERV_GEOQUIMICA_2022/MapServer/0` | Punto / **28,184** | 112 campos: CODIGO, ANO_DEL_P, REGION, CUENCA, LABORATORIO, LATITUD/LONGITUD, UTM_E/N/ZONA, **AS_PPM, HG_PPB, HG_PPM, PB_PPM, CD_PPM, CU_PPM**, ZN_PPM, etc., N_BOLETIN, URL_BOLETIN | Solo REGION (sin provincia/distrito) → join espacial | 2000–2018 (valores distintos de ANO_DEL_P) | Valores son **String** ("26.9", "<0.01", "N.R."); parsear. Cobertura 21 regiones: Amazonas, Áncash, Apurímac, Arequipa, Ayacucho, Cajamarca, Cusco, Huancavelica, Huánuco, Ica, Junín, La Libertad, Lambayeque, Lima, Moquegua, Pasco, Piura, Puno, Tacna, Tumbes (+"Puno (Bolivia)"). **Sin Loreto, Ucayali, Madre de Dios, San Martín.** Ejemplo real (Puno, cuenca Inambari, 2018, lab ALS): As 26.9 ppm, Hg 3.09 ppm, Pb 313 ppm, Cd 0.75 ppm. |
| Geoquímica sed. quebrada "Total" (versión anterior) | `.../SERV_GEOQUIMICA/MapServer/1` | Punto / 28,336 | CODIGO, PROYECTO, ANNO, AS_PPM, HG_PPM, PB_PPM, CD_PPM, CU_PPM (alias "Arsenico(ppm)" etc.), LATITUD/LONGITUD, BOLETIN | ninguna → join espacial | 2002–2017 | maxRec 1000; LABORATORIO nulo; duplica en gran parte a la capa 2022 |
| Geoquímica de aguas superficiales | `.../SERV_GEOQUIMICA_2022/MapServer/5` | Punto / **54** | AS_MG_L, PB_MG_L, CD_MG_L, CU_MG_L, **HG_UG_L**, aniones, LABORATORIO, INFORME | ninguna | s/d | Muy pequeña; útil solo como muestra |
| Sedimento de quebrada BDG (base nueva) | `.../SERV_GEOQUIMICA_2022/MapServer/9` | Punto / 97 | REGION, PROVINCIA, **DISTRITO**, F_MTRA, DATA_RESULTADOS (link) | distrito | reciente | Sin valores de elementos en la capa |
| Atlas Geoquímico (dispersión y anomalías As, Hg, Pb, Cu, Zn, Au, Ag, Mo, Cr, Ni, Co) | `.../SERV_ATLAS_GEOQUIMICO/MapServer` (capas 0–36; As=2, Hg=14, Cu=8, Pb=29) | **Raster** | ninguno (Map,Query sin campos) | — | — | Solo visualización (WMS/export image), no descargable por query. SR 32718 |
| **Catastro minero** (derechos mineros) | `.../SERV_CATASTRO_MINERO_WGS84/MapServer/0` | Polígono / **66,975** | CODIGOU, CONCESION, TIT_CONCES, HECTAGIS, ESTADO (código), D_ESTADO (texto), SUSTANCIA (M/N), **DEPA, PROVI, DISTRI**, FEC_DENU, FECHA_ACTUALIZACION | distrito (nombre) | actualización diaria | Estados: T/N/E titulados (D.L. 708 / 109), P/D en trámite, F/L/X/Y extinguidos, A cantera, B planta, R relave, Q acumulación, H aviso retiro L.30428. Titulados+acumulación (T,N,E,Q) = **42,919**. Capa 1 = DGM MINEM (2,120). Sin ubigeo numérico |
| **Pasivos ambientales mineros** (MINEM) | `.../SERV_PASIVO_AMBIENTAL/MapServer/0` | Punto / **6,122** | REGION, PROVINCIA, **DISTRITO**, CUENCA, TIPO, SUBTIPO, EXUNIDAD, CODIGODM, TITULARDM, RESPONSABLE, GENERADOR, ESTUDIOAMB, ESTE/NORTE/ZONA, N (ID) | distrito (nombre) | descripción dice "MINEM Octubre 2011" pero n≈inventario 2025 → vintage incierto | 20 regiones; maxRec 1000. Capa 1 "Relave – inventario" 296 con volumen, riesgo, contaminación |
| **REINFO** (MINEM→INGEMMET) | `.../SERV_REINFO/MapServer/0` | Punto / **87,334** | COD_REINFO, NOMBRE_MIN, M_RUC, DEPARTAMENTO, PROVINCIA, **DISTRITO**, ID_DIST (nulo en muestra), TIPO_ACT, **ESTADO**, A_INSCRIPCION, LATITUD_G84/LONGITUD_G84, FECHA_ACTUALIZACION | distrito (nombre) | FECHA_ACTUALIZACION 2025-02-26 en muestra | ESTADO solo **VIGENTE 23,816 / SUSPENDIDO 63,518** (sin EXCLUIDO). Parece snapshot previo a la depuración DS 012-2025-EM (jul-2025: 50,565 excluidos). SR 3857 (pedir `outSR=4326`) |
| Pequeña minería (muestras de campo con lab) | `.../SERV_PEQUENA_MINERIA/MapServer/0` | Punto / 2,160 | REGION (cód.), **DISTRITO (ubigeo 6 díg.)**, F_MTRA, ANALISIS_LABORATORIO (HTML: Au g/TM, etc.) | ubigeo | 2016+ | Resultados embebidos en HTML |
| Otros útiles | SERV_CARTERA_PROYECTOS_MINEROS, SERV_UEAs, SERV_CERTIFICADO_AMBIENTAL, SERV_LIBREDENUNCIABILIDAD, SERV_CATASTRO_MADRE_DIOS, SERV_Catastro_Pataz, SERV_GEOLOGIA_AMBIENTAL (línea base) | — | — | — | — | No inspeccionados a nivel de campo |

Licencia: no declarada en REST; GEOCATMIN indica "carácter referencial, solo consulta".

## 2. MINEM — PAM, REINFO, producción — VERIFICADO (gob.pe devuelve 418 a WebFetch; curl con UA de navegador funciona)

| Dataset | URL exacta | Formato | Campos | Unidad | Fecha | Estado / limitación |
|---|---|---|---|---|---|---|
| **Inventario PAM 2026** — RM 269-2026-MINEM/DM (7-jul-2026, incluye 120 PAM nuevos) | Norma: `https://cdn.www.gob.pe/uploads/document/file/10273924/8348733-rm-n-269-2026-minem-dm.pdf`; Anexo en 8 partes: `https://cdn.www.gob.pe/uploads/document/file/10343122/8348733-anexoinventario_2026-parte-1.pdf` … `/10343129/8348733-anexoinventario_2026-parte-8.pdf` (ids 10343122–10343129) | PDF **escaneado** (parte 1: 27 pp, 15 MB; parte 8: 20 pp) | sin texto extraíble | — | jul-2026 | Requiere OCR. No hay Excel |
| **Inventario PAM 2025-II** — RM 338-2025-MINEM/DM (17-oct-2025) | Norma: `https://cdn.www.gob.pe/uploads/document/file/8857101/7307048-rm-n-338-2025-minem-dm.pdf`; **Anexo: `https://cdn.www.gob.pe/uploads/document/file/8857848/7307048-anexo_actualizacion_rm-338-2025-minem-dm.pdf`** | PDF con texto, 228 pp, 3 MB | N, ID, EUM (ex unidad), TIPO, SUBTIPO, CUENCA, REGION, PROVINCIA, **DISTRITO**, **ESTE, NORTE, ZONA** (UTM), CÓDIGO DM, NOMBRE DM, TITULAR, GENERADOR, RESPONSABLE, ESTUDIO AMBIENTAL | distrito (nombre) + UTM | oct-2025 | **6,116 filas** (último N). Parseable con pdfplumber (celdas multilínea). Sin ubigeo |
| Inventario PAM 2025-I — RM 056-2025 (19-feb-2025) | `https://cdn.www.gob.pe/uploads/document/file/7667901/6496380-anexo-act-inv-pam-13022025.pdf` | PDF | ídem | — | feb-2025 | +42 incl., 5 act., 17 excl. |
| Colección histórica 2007→2026 | `https://www.gob.pe/institucion/minem/colecciones/24670-inventario-de-pasivos-ambientales-mineros` | HTML índice | — | — | — | Un RM+anexo por año |
| REINFO padrón (Excel/CSV) | Consulta web: `https://pad.minem.gob.pe/REINFO_WEB/Index.aspx`; portal `https://pad.minem.gob.pe/REINFO_PORTAL/` | HTML consulta (ASP.NET) | — | — | — | **NO encontrado padrón descargable** en gob.pe ni datosabiertos. La única fuente masiva es la capa GEOCATMIN SERV_REINFO. Metadato geoidep: `https://catalogo.geoidep.gob.pe/metadatos/srv/api/records/1cd7ef4b-7d00-443f-a47f-849623e33e7b` (sin enlace de datos) |
| **Producción minera por unidad minera** (MINEM/DGM) | Página: `https://www.gob.pe/institucion/minem/informes-publicaciones/5472883-produccion-minera`; ZIP 2025: `https://cdn.www.gob.pe/uploads/document/file/7850353/5472883-2025.zip`; ene-jun 2026: `https://cdn.www.gob.pe/uploads/document/file/9679417/5472883-ene-jun-2026.zip`; 2021: `.../6209623/5472883-2021.zip` | ZIP→3 XLSX (Producción metálica, carbonífera, no metálica) | MINERAL, UNIDAD (TMF), ETAPA, PROCESO, ESTRATO, TITULAR, UNIDAD MINERA, **DEPARTAMENTO, PROVINCIA**, (+distrito/meses) | provincia (verificado); revisar columna distrito | 2021, 2025, 2026 | Agregable a región. Datos abiertos: `https://www.datosabiertos.gob.pe/dataset/estadística-de-la-producción-de-los-principales-productos-metálicos-y-no-metálicos-nivel` (página existe; recursos no listados en HTML) |
| Otros datosabiertos MINEM | `/dataset/registro-especial-de-comercializadores-y-procesadores-de-oro`, `/dataset/directorios-mineros`, `/dataset/minem-contratistas-mineros`, `/dataset/accidentes-mortales-en-mina`, `/dataset/estadística-de-enfermedades-ocupacionales-en-minería` | CSV/XLSX | — | — | — | Listados en `https://www.datosabiertos.gob.pe/group/ministerio-de-energía-y-minas-minem` |

## 3. OEFA PIFA (ArcGIS 11.5) — VERIFICADO (respondió 200 desde esta IP; soporta geoJSON y paginación)
Base: `https://pifa.oefa.gob.pe/arcgis/rest/services` (30 carpetas; raíz sin servicios).

| Capa | URL | Geom / n | Campos clave | Territorial | Notas |
|---|---|---|---|---|---|
| Minería informal (áreas) | `.../REINFO/SERV_MIN_ILEGAL_AREA/MapServer/0` | Polígono / **10,277** | NOMBRE_AREA, COD_MINF, FUENTE ("REINFO"), CREATED_DATE | ninguna → join espacial | creado mar-2025 |
| Minería ilegal (áreas) | `.../REINFO/SERV_MIN_ILEGAL_AREA/MapServer/1` | Polígono / **2,044** | COD_MIL, FUENTE ∈ {UFAFEMA-PPO, GORE, REINFO-Excluido} | ninguna | ídem |
| Conflictos socioambientales (áreas de influencia) | `.../CONFLICTOS/SERV_CONSULTAS_MAPA_GCS_PIFA/MapServer/0` | Polígono / **2,101** | COD_CASO, ROTULO, ETAPA, ESTADO, NIVEL_SENS, AREA_INF (texto distritos), AREA_KM2 | texto | ej. "Caso Quellaveco" |
| Vigilancia ambiental (estaciones) | `.../VIG_MON/SERV_VIGILANCIA_AMBIENTAL_PROD/MapServer/0` | Punto / 41 | NOMB_ESTACION, DEPARTAMENTO/PROVINCIA/DISTRITO, CUENCA, RUTA_FICHA | distrito | Solo estaciones (aire), sin mediciones |
| Riesgo ambiental por unidad fiscalizable | `.../RIESGOS/SERV_RIES_AMB_UF/MapServer/5` | Polígono / **19,181** | SUBSECTOR, ADMINISTRADO, UNIDAD_FISCALIZABLE, FECHA, RIESGO_PON, RIESGO_EST (Muy Alto…Muy Bajo) | ninguna | feb-2025 |
| Riesgo depósitos de relaves | `.../RIESGOS/WMS_RIESGO_DEP_RELAVES_PROD/MapServer/4` | Polígono / **12,625** | GEOMENBRANA, SATURA_AGUA, DIST_DIQUE, VULNERABILIDAD, HIDROMETEOROLOGIA, RIESGO | ninguna | — |
| **Emergencias ambientales** | `.../ODES/SERV_OD_INF_OEFA/MapServer/1` | Punto / **3,930** | CODIGO (EA20-0006), DESCRIPCION, ADM_INVOLUCRADOS, NRO_DOC_ADM (RUC), UF_INVOLUCRADOS, SECTOR, SUBSECTOR (Hidrocarburos…), **DEPARTAMENTO/PROVINCIA/DISTRITO**, FECHA_EMERGENCIA, LATITUD/LONGITUD | distrito (nombre) | Cubre derrames de hidrocarburos; muestra 2020 |
| Puntos de monitoreo de supervisión | `.../ODES/SERV_OD_INF_OEFA/MapServer/3` | Punto / 96,163 | CUC, PTAL_ADMIN, PTAL_UF, DES_SUB_SECTOR, TXMATRIZ, FECHAINI_EJEC | ninguna | Metadatos de puntos; valores en los CSV de datosabiertos (clave CUC) |
| Unidades fiscalizables minería | `.../WFS/SERVICIO_UN_FISCALIZABLE_OEFA/MapServer/3` | Polígono / 4,990 | ADMINISTRADO, UNIDAD_FISCALIZABLE, COD_UF | ninguna | — |

## 4. ANA — VERIFICADO parcialmente
`geo.ana.gob.pe` **no resuelve DNS**. El geoportal vivo es `https://geosnirh.ana.gob.pe/server/rest/services` (carpeta `Público`, ~80 servicios). Observatorio: `https://snirh.ana.gob.pe/observatoriosnirh/` (app HTML, sin descarga directa). Grupo ANA en datosabiertos solo tiene `/dataset/puntos-críticos`.

| Capa | URL | n | Campos | Territorial | Limitación |
|---|---|---|---|---|---|
| Red de puntos de muestreo calidad de agua | `https://geosnirh.ana.gob.pe/server/rest/services/Público/PuntosdeMuestreo/MapServer/3` | **3,255** | CODIGO, DESCRIPCION, AAA, ALA, **DEPARTAMENTO/PROVINCIA/DISTRITO**, LAT/LON, **CATEGORIA** (ECA), CodigoUH, CUERPOAGUA, ESTADO, ICARHS, RPT_ICARHS (URL a `snirh.ana.gob.pe/dcerh/Forms/Monitoreo/rptMonitoreoResultado.aspx?...`) | distrito | **Sin valores de parámetros**; los resultados están en reportes ASPX por punto (no verificado si scrapeable) |
| Índice ICARHS por punto | `.../Público/CalidadAguaICARHS/MapServer/2` | 1,652 | ídem + ICARHS | distrito | muestra con atributos vacíos |
| Fuentes contaminantes identificadas | `.../Público/FuentesContaminantes/MapServer/14` | **6,604** | **UBIGEO**, NATURALEZAFC, TIPOFC (Domésticas, Mineras…), CUERPOAGUA, CAUDAL, FECINICIOIDENT, NUMEROINFORME | ubigeo | 2017+ |
| Autorizaciones de vertimiento | `.../Público/vVertimientos/MapServer/16` | 5,221 | RAZONSOCIAL, DISTRITO, CUERPOAGUA, ESTANDARCATEGORIA, PARAMETROS (incl. As, Cd, Hg, Pb totales), FRECUENCIAMONITOREO | distrito | Autorizaciones, no mediciones |
| Derechos de uso de agua minero | `.../Público/DUA_Minero/MapServer/28` | 754 | Der_usu, Vol_der, Der_Dis (ubigeo), FuenteNatural, vigente | ubigeo | 2026 |
| Resultados As/Hg/Pb/coliformes por muestra (crudo) | — | — | — | — | **NO encontrado como dataset abierto**; solo informes técnicos en `repositorio.ana.gob.pe` y datos INAIGEM Quillcay 2015–2021 en datosabiertos |

## 5. DIGESA / SUNASS — NO ENCONTRADO como datos abiertos
- DIGESA: sin dataset en datosabiertos (grupo MINSA solo tiene SINADEF, vigilancia epidemiológica, etc.). Solo notas de prensa. **No accesible.**
- SUNASS: no hay grupo en datosabiertos (404). Benchmarking Regulatorio EPS 2025 (PDF): `https://cdn.www.gob.pe/uploads/document/file/8591665/7109489-benchmarking-regulatorio-de-las-eps-2025.pdf` (indicadores por EPS, incluye cloración). CAMI YAKU `https://camiyaku.vercel.app/` responde 200 pero sin enlaces a datasets. Dataset "número de conexiones activas de agua potable [SUNASS]" existe en datosabiertos (no calidad).

## 6. Deforestación por minería
| Fuente | URL | Formato | Estado |
|---|---|---|---|
| **Amazon Mining Watch** (Earth Genome; base de MAAP #226/#233) | Listado S3: `https://data.source.coop/earthgenome/amazon-mining-watch/`; **`https://data.source.coop/earthgenome/amazon-mining-watch/amazon_basin_detections.geojson`** (109 MB); `amazon_basin_mining_scar_masks.tif` (63 MB, 10 m); README `.../README.md` | GeoJSON (parches 480 m con confianza, periodo de primera detección, confirmado/provisional) + GeoTIFF | **Verificado**: actualizado 20-ago-2026; anual 2018–2025 + trimestres a Q2-2026; licencia **CC-BY 4.0**. Cubre toda la cuenca amazónica (recortar a Perú y join a distritos) |
| MAAP #233 (jul-2025) | `https://www.maapprogram.org/gold-mining-peru-amazon/` | Informe | Verificado: 139,169 ha deforestación minera Amazonía peruana; 135,939 ha en Madre de Dios (97.5 %). **Sin descarga de datos**; cita: Pacsi R. et al. (2025) MAAP 233 |
| Geobosques descarga por distrito (Excel) | `https://geobosques.minam.gob.pe/geobosque/view/descargas.php` | Excel/SHP | **No automatizable**: la página es un formulario de registro; el listado real solo aparece tras registrarse. Páginas `api.php`/`geoapi.php`/`view/api/*.html` devuelven **404** |
| Geobosques REST (MINAM) | `https://gis.bosques.gob.pe/server/rest/services/Interoperabilidad/perdida_bosque_humedo_2001_2025/MapServer` (capas por año 2001–2024 + "Pérdida Antrópica 2025", "Pérdida Natural 2025") | **Raster** (sin query) | Verificado; requiere zonal stats. WMS: `.../MapServer/WMSServer` |
| Geobosques límites distritales con ubigeo | `https://gis.bosques.gob.pe/server/rest/services/Geobosques/serv_geobosques_bosque_perdida/MapServer/2` | Polígono / **1,892** distritos (coddep, codprov, coddist, **ubigeo**, nomdist) | Verificado. Útil como capa base para los joins espaciales de todo el informe |
| Alertas tempranas | `https://gis.bosques.gob.pe/server/rest/services/Interoperabilidad/alertas_tempranas_2026/MapServer` | Map/WMS | verificado que existe |

## 7. Derrames de hidrocarburos / emergencias
| Fuente | URL | Formato | Estado |
|---|---|---|---|
| **OEFA – Emergencias ambientales (geo)** | ver §3: `https://pifa.oefa.gob.pe/arcgis/rest/services/ODES/SERV_OD_INF_OEFA/MapServer/1` | REST/geoJSON, 3,930 puntos con DISTRITO, SUBSECTOR, FECHA | **Verificado** — mejor fuente |
| OEFA – IPASH (pasivos hidrocarburos, monitoreos) | `https://www.datosabiertos.gob.pe/sites/default/files/IPASH_Agua_0.xlsx` (138 KB), `IPASH_Aire.xlsx`, `IPASH_Sedimento_1.xlsx`, `IPASH_Suelo_0.xlsx` (página `/dataset/oefa-evaluación-ambiental`) | XLSX | Verificado (dic-2025) |
| OSINERGMIN – estadística trimestral emergencias hidrocarburos (unidades menores) | `https://www.osinergmin.gob.pe/seccion/centro_documental/hidrocarburos/Documentos/Administrado/Osinergmin-DSHL-Estadistica-Trimestral-EHA.xlsx` (26 KB) y `...-EHA-TA.xlsx` (30 KB) | XLSX agregado | Verificado (9-ene-2026); no georreferenciado. Página: `https://www.osinergmin.gob.pe/empresas/hidrocarburos/unidades-menores/estadistica-emergencias` |
| Carpeta PIFA `EMER_HIDRO` y `DERRAME_TALARA_2024` | — | — | Existen pero **vacías** (0 servicios). La Pampilla: `ESPECIALES/SERV_RESUL_MON_PAMPILLA_*` |

## 8. datosabiertos.gob.pe (licencia ODC-BY; usar host `www.`, sin `www` no resuelve; API CKAN `/api/3/action` redirige y **no funciona**)

| Institución | Dataset | Recurso directo | Tamaño / fecha | Campos |
|---|---|---|---|---|
| OEFA | Monitoreos agua superficial en supervisión | `https://www.datosabiertos.gob.pe/sites/default/files/Monitoreos_AGUA_SUPERFICIAL.csv` (+ `Diccionario%20Datos_Monitoreo_Agua_Agua_superficial.xlsx`) | **269 MB**, 2-sep-2026 | TXORIGEN, ANHO, MES, CUC, COORDINACION (sector), **TXUBIGEO** (texto "DEP, PROV, DIST"), TXZONA, COORD_NORTE/ESTE, PUNTO_MUESTREO, FECHA_PTO, MATRIZ, **PARAMETRO, SIGNO, UNIDAD** y valor en columnas anchas por método (Metales.Totales, Metales.Disueltos.por.ICP.MS.incluido.Hg…). Desde 2014 |
| OEFA | Monitoreos agua subterránea | `.../Monitoreos_AGUA_SUBTERRANEA.csv` | 39 MB | ídem |
| OEFA | Monitoreos sedimento | `.../Monitoreos_SEDIMENTO.csv` | 99 MB | ídem, mg/kg MS |
| OEFA | Evaluaciones ambientales tempranas – agua | `.../Monitoreos%20AGUA%20EVALUACION%20TEMPRANA.csv` (+ `DiccionarioDatos_Monitoreos_AGUA_EVALUACION_TEMPRANA.xlsx`) | 50 MB, 2-sep-2026 | ID_INFORME, NOMBRE_EVALUACION, ESTE/NORTE/ZONA/DATUM, FECHA_MUESTRA, PARAMETRO, UNIDAD, SIGNO, columnas por método; Fecha_corte 2025-04-30. **Sin ubigeo** |
| OEFA | Evaluaciones de causalidad – agua | `.../Monitoreos%20AGUA%20EVALUACION%20CAUSALIDAD.csv` | 65 MB | ídem |
| OEFA | EAS / EAC por componente | `EAS_Agua_1.xlsx`, `EAS_Sedimento_1.xlsx`, `EAS_Suelo_1.xlsx`, `EAS_Aire_0.csv`, `EAC_Agua_0.xlsx`, `EAC_Sedimento_1.xlsx`, `EAC_Biota_0.xlsx`… (todos bajo `/sites/default/files/`) | — | Páginas `/dataset/evaluaciones-ambientales-de-seguimiento-eas`, `/dataset/evaluaciones-ambientales-de-causalidad-eac` |
| OEFA | RUIAS (infractores sancionados) | `.../1a_Registro%20%C3%9Anico%20de%20Infractores%20Ambientales%20Sancionados.csv` | — | — |
| OEFA | Inventario nacional de áreas degradadas por residuos | `/dataset/inventario-nacional-de-áreas-degradadas-por-residuos-sólidos-municipales-organismo-de` | — | no inspeccionado |
| MINAM | Residuos sólidos (generación, valorización distrital), incendios en cobertura vegetal (registro histórico), áreas degradadas de ecosistemas | grupo `https://www.datosabiertos.gob.pe/group/ministerio-del-ambiente-minam` | — | Ninguno de calidad ambiental/minería |
| ANA | Puntos críticos (inundación/erosión) | `/dataset/puntos-críticos` | — | único dataset ANA |
| MINEM | ver §2 | — | — | — |
| INAIGEM | Fisicoquímicos agua UH Quillcay 2015–2021 | `/dataset/datos-de-los-parámetros-fisicoquímicos-del-agua-superficial-de-la-unidad-hidrográfica-uh-3` | — | Áncash, local |
| OEFA portal propio | `https://datosabiertos.oefa.gob.pe/search/?resource=ds` | HTML | Categorías Evaluación/Supervisión/Fiscalización; API OpenDataSoft `/api/explore/v2.1` y `/api/datasets/1.0` devuelven **404** |

## 9. Estándares — ECA Agua VERIFICADO desde el PDF oficial; LMP NO verificado en texto primario
Fuente ECA: `https://www.minam.gob.pe/wp-content/uploads/2017/06/DS-004-2017-MINAM.pdf` (10 pp, texto extraído con pdftotext). Valores en mg/L:

| Parámetro | Cat.1-A1 | A2 | A3 | Cat.1-B1 (recreación) | Cat.3 D1 riego | Cat.3 D2 bebida animales | Cat.4 E1 lagunas | E2 ríos costa-sierra | E2 ríos selva | E3 estuarios | E3 marinos |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Arsénico | **0,01** | 0,01 | 0,15 | 0,01 | 0,1 | 0,2 | 0,15 | 0,15 | 0,15 | 0,036 | 0,036 |
| Mercurio | **0,001** | 0,002 | 0,002 | 0,001 | 0,001 | 0,01 | 0,0001 | 0,0001 | 0,0001 | 0,0001 | 0,0001 |
| Plomo | **0,01** | 0,05 | 0,05 | 0,01 | 0,05 | 0,05 | 0,0025 | 0,0025 | 0,0025 | 0,0081 | 0,0081 |
| Cadmio | **0,003** | 0,005 | 0,01 | 0,01 | 0,01 | 0,05 | 0,00025 (disuelto) | 0,00025 | 0,00025 | 0,0088 | 0,0088 |

LMP agua potable DS 031-2010-SA: el PDF oficial `https://cdn.www.gob.pe/uploads/document/file/273650/reglamento-de-la-calidad-del-agua-para-consumo-humano.pdf` (33 pp) descargó OK pero es **imagen escaneada** (sin texto; `digesa.minsa.gob.pe/.../Reglamento_Calidad_Agua.pdf` da 403). Los valores As 0,010 / Hg 0,001 / Pb 0,010 / Cd 0,003 mg/L coinciden con ECA Cat.1-A1 y con fuentes secundarias, pero **no los confirmé en el texto primario** (requiere OCR del Anexo III).

## Los 3 datasets más viables HOY por script para cruce distrital contaminación↔educación

1. **INGEMMET SERV_REINFO + SERV_CATASTRO_MINERO_WGS84 (presión minera por distrito).** REINFO trae DISTRITO/DEPARTAMENTO como texto y ESTADO; catastro trae DISTRI y estado del derecho. Descarga completa por rangos de OBJECTID (2000 por llamada):
   `https://geocatmin.ingemmet.gob.pe/arcgis/rest/services/SERV_REINFO/MapServer/0/query?where=OBJECTID>=1 AND OBJECTID<2001&outFields=COD_REINFO,DEPARTAMENTO,PROVINCIA,DISTRITO,ESTADO,TIPO_ACT,LATITUD_G84,LONGITUD_G84&outSR=4326&f=geojson`
   Normalizar nombres de distrito → ubigeo con la capa `gis.bosques.gob.pe/.../serv_geobosques_bosque_perdida/MapServer/2` (1,892 distritos con ubigeo) o vía join espacial con lat/lon. Salida: nº inscritos vigentes/suspendidos y ha concesionadas por distrito.

2. **INGEMMET SERV_GEOQUIMICA_2022/0 (28,184 muestras de sedimento con As/Hg/Pb/Cd/Cu ppm).** Join espacial punto-en-distrito; indicador = mediana y % de muestras sobre umbral por distrito (p. ej. As > 20 ppm, Hg > 1 ppm, Pb > 100 ppm; definir umbral con criterio geoquímico, no ECA agua). Cobertura: sierra y costa, no Amazonía.
   `.../SERV_GEOQUIMICA_2022/MapServer/0/query?where=OBJECTID>=1 AND OBJECTID<2001&outFields=CODIGO,ANO_DEL_P,REGION,CUENCA,AS_PPM,HG_PPM,HG_PPB,PB_PPM,CD_PPM,CU_PPM,LABORATORIO&outSR=4326&f=geojson`

3. **OEFA `Monitoreos_AGUA_SUPERFICIAL.csv` (269 MB) + capa de emergencias ODES.** Filtrar PARAMETRO ∈ {Arsénico, Mercurio, Plomo, Cadmio} totales, unidad mg/L; distrito desde TXUBIGEO (texto) o coordenadas UTM (TXZONA); comparar contra ECA Cat.3/Cat.4 según CATEGORIA del cuerpo (usar la capa ANA PuntosdeMuestreo para la categoría cuando coincida). Complementar con `ODES/SERV_OD_INF_OEFA/MapServer/1` (3,930 emergencias con DISTRITO y fecha). Sesgo: muestreo dirigido a unidades fiscalizadas, no aleatorio.

Alternativa rápida de PAM: parsear el anexo RM 338-2025 (PDF con texto, 6,116 filas con DISTRITO y UTM) o usar directamente `SERV_PASIVO_AMBIENTAL/0` (6,122 puntos con DISTRITO).

## No verificado / no accesible (honestidad)
- Padrón REINFO en Excel/CSV: no existe públicamente (solo consulta web y capa GEOCATMIN).
- Resultados de laboratorio ANA por muestra (As/Hg/Pb/coliformes): no como dataset; solo reportes por punto (ASPX) e informes PDF.
- DIGESA calidad de agua potable por localidad: nada descargable.
- SUNASS parámetros por EPS: solo PDF de benchmarking.
- Geobosques Excel por distrito: detrás de formulario de registro; API documentada devuelve 404.
- MAAP: sin descargas; usar Amazon Mining Watch (CC-BY) como sustituto.
- LMP DS 031-2010-SA: PDF escaneado, valores no confirmados en el primario.
- Anexo PAM 2026 (RM 269-2026): escaneado, requiere OCR.
- Vintage de SERV_PASIVO_AMBIENTAL (descripción "2011", n≈2025) y de SERV_REINFO (aparenta pre-depuración jul-2025): confirmar con MINEM.
