# Inventario de repositorios y datos existentes (Fase 0)

Auditoría realizada el 2026-09-25 sobre los repositorios locales de `~/Repos` y `~/Documents/Repos` (todos con remoto en github.com/unimauro) y el sitio unimauro.github.io. Se inspeccionaron README, ETL y archivos de datos. No se revisó ningún repositorio privado al que no se tuviera acceso local; no se accedió al VPS (la lectura remota fue bloqueada por la política de la sesión; se usaron las copias locales de los JSON que el VPS sirve).

| Repositorio | Qué es | Último commit | Datos reutilizables | Estado | Integración en este observatorio |
|---|---|---|---|---|---|
| `observatorio-ambiental-peruano` | Observatorio ambiental (React+Vite, GH Pages) con 9 ejes | 2026-09-01 | 30+ capas GeoJSON oficiales: pasivos hidrocarburos (3 266), suelos empetrolados (3 233), relaves OEFA (206), riesgo ambiental OEFA (195), unidades mineras (313), lotes (78), minería ilegal en ANP (179), ANP, comunidades, monitoreo indígena; `research/endpoints.json` con endpoints sondeados (PIFA, GISEM, SERNANP, GEOCATMIN) y gotchas | Real, oficial, vigente | **Reutilizado**: 7 capas copiadas a `data/raw/oap-*.geojson` y contadas por distrito; catálogo de endpoints reutilizado |
| `educacion-peru` | Radiografía de la educación básica (HTML+Chart.js) | 2026-08-05 | `data.json`: ENLA 2024 4.º primaria por distrito (1 639), UGEL, región y estratos; serie 2016–2024 nacional; presupuesto educación (MEF) | Real (UMC-MINEDU) | **Reutilizado** como variable de resultado educativo |
| `mortalidad-peru` | Observatorio de mortalidad (SINADEF 2017–2026) | 2026-09-24 | `data/raw/SINADEF_DATOS_ABIERTOS.csv` (617 MB, 1,58 M certificados), pipeline de causa básica y grupos CIE-10, población INEI por departamento | Real (MINSA) | **Reutilizado**: nueva agregación distrital por causa (`etl/sinadef_distrital.py`) |
| `qhaway-dashboard` | QHAWAY 2.0 (FIEECS-UNI): presupuesto distrital SIAF-MEF, pisos altitudinales, riesgos, IPT. Frontend en GH Pages + qhaway.org; API FastAPI + Postgres en el VPS (217.15.168.100, `qhaway-api`, `qhaway-db`) con `gasto_distrito` 2012–2026 | 2026-09-01 | `indicadores-distrito.json` (1 894: población, IDH, pobreza, agua, desagüe, electricidad, internet, altitud, médicos), `distritos.geojson` (1 834), `por-distrito-{2021..2026}.json` (gasto por distrito y nivel), ETL REDATAM/INFORHUS documentado | Real (INEI, PNUD, MEF, MINSA-DIGEP) | **Reutilizado**: indicadores socioeconómicos como controles y gasto 2021–2026. La base Postgres del VPS contiene la serie completa 2012–2026: pendiente exponer un endpoint `/api/distrito/{ubigeo}` para series largas |
| `bullying-peru` | Observatorio de bullying escolar (SíseVe) | 2026-09-25 | `data/geo/peru-distrital.geojson` (1 826, 0,8 MB, simplificado), pensiones por distrito | Real | **Reutilizado** como geojson base |
| `como-esta-lima` | Dashboard Lima 2019–2026 | 2026-09-12 | Geojson Lima; ~230 series MEF/INEI/ATU | Real, solo Lima | No integrado (alcance metropolitano) |
| `plan-peru-2050` | Plataforma Plan Perú 2050 (VPS) | 2026-09-24 | `data/distritos.geojson`, `presupuesto_distrital.json`, índice de 1 229 documentos | Real | No integrado; el índice documental sirve para RAG futuro |
| `peru-transparente` | Mapa nacional de funcionarios/entidades | 2026-09-25 | Entidades, presupuestos, DJ; conectores documentados | Real | No integrado (gobernanza, no ambiente) |
| `evaluacion-mimp` | Evaluación del MIMP 2019–2025 | 2026-09-09 | CSV MEF | Real | No integrado |
| `proyecto-inti` | Gemelo digital 2075 (HTML) | — | IDH/pobreza/población reales (ya en qhaway); **los demás índices son sintéticos** | Mixto | Solo geojson; índices sintéticos NO usados |
| `petroperu-analytics` | Analítica financiera Petroperú | 2026-06-08 | Dataset marcado `illustrative` | **Ilustrativo** | No usado |
| `aurumscan-geoai-research` / `perfil-yacimientos-ia` | Investigación GeoAI y perfil de venta (documentos) | 2026-05/06 | Sin datos; referencia metodológica sobre anti-overclaiming y GEOCATMIN | Documental | Metodología reutilizada (disclaimer científico) |
| `qhaway-observatorio-2026` | Propuesta institucional QHAWAY 2.0 (PDF) | 2026-06-17 | Sin datos | Documental | Marco institucional (FIEECS-UNI) |
| `observatorio-smartphones-adolescentes` | Estudio smartphones (React) | — | ~80 % estimaciones | Estimado | No usado |
| `observatorio-{uni,unsa,unsaac,sanmarcos,villarreal,cantuta,ensad,fonafe,idoneidad-estado,poder-economico,defensa-interior}` | Observatorios universitarios/estatales | varios | Ver `docs/inventario-observatorios-detalle.md` (generado por agente) | Varios | Sin variables ambientales/sanitarias distritales |

## Nuevas fuentes incorporadas en esta fase (no existían en ningún repo)

| Fuente | Registros | Cómo |
|---|---|---|
| INGEMMET Programa Nacional de Geoquímica — sedimentos de quebrada (As, Hg, Pb, Cd, Cu, …) | 28 184 | `etl/arcgis.py` sobre GEOCATMIN `SERV_GEOQUIMICA_2022/0` |
| INGEMMET geoquímica de aguas superficiales | 54 | `SERV_GEOQUIMICA_2022/5` |
| INGEMMET Atlas Geoquímico — anomalías As/Hg/Pb | 185 + … | `SERV_ATLAS_GEOQUIMICO/{1,13,28}` |
| MINEM Inventario de Pasivos Ambientales Mineros | 6 122 | `SERV_PASIVO_AMBIENTAL/0` |
| MINEM REINFO (vigente/suspendido, beneficio/explotación) | 87 334 | `SERV_REINFO/0` |
| INGEMMET muestras de pequeña minería | 2 160 | `SERV_PEQUENA_MINERIA/0` (descargado, sin integrar) |
| INGEMMET fuentes de agua (hidrogeología, iones mayores) | 9 425 | `SERV_HIDROGEOLOGIA_PERU/1` (descargado, sin metales) |

## Oportunidades de integración pendientes
- **QHAWAY (VPS)**: exponer serie de gasto 2012–2026 por distrito y función (salud, educación, ambiente) desde Postgres; hoy solo JSON agregados 2021–2026.
- **mortalidad-peru**: compartir el pipeline de causa básica como paquete común; estandarizar tasas por edad con población distrital por grupo etario (INEI).
- **observatorio-ambiental-peruano**: refrescar capas PIFA (403 desde datacenter) desde IP residencial y añadir REINFO/áreas de minería ilegal (`SERV_MIN_ILEGAL_AREA`).
- **educacion-peru**: ENLA 2024 de 2.º de secundaria y ECE 2016–2019 distrital para series temporales.
- **Lima en Movimiento / como-esta-lima**: no aplican por ahora.
