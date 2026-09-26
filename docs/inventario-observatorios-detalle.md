# Inventario detallado de observatorios y repos locales

Fecha: 2026-09-25. Inventario de solo lectura. Rutas bajo `/Users/unimauro/Documents/Repos/` salvo que se indique `~/Repos/` (= `/Users/unimauro/Repos/`). Se ignoraron node_modules, dist, venv y `.claude/worktrees`.

**Conclusión:** solo `plan-peru-2050` (~/Repos) y `observatorio-ambiental-peruano` tienen datos distritales/territoriales reales reutilizables. El resto es institucional (planillas, proveedores, presupuesto de pliego) o solo Lima. No hay datos distritales de educación ni de salud por establecimiento: deben venir de fuentes nuevas (ESCALE, RENIPRESS, SUSALUD).

## 1. Repos

| Repo | Qué es | Último commit | Remoto | Stack | Datos reutilizables |
|---|---|---|---|---|---|
| observatorio-ambiental-peruano | Observatorio ambiental con datos abiertos | 2026-09-01 | unimauro/observatorio-ambiental-peruano | React+Vite+Tailwind, ETL Python | **Sí**, puntos georreferenciados (ver §2). Etiqueta cada capa como verificado / estimado / referencial. |
| observatorio-cantuta | Transparencia UNE La Cantuta (pliego 528) | 2026-07-05 | unimauro/observatorio-cantuta | HTML+JS estático, ETL Python | No territorial: planilla, proveedores, presupuesto, bibliometría |
| observatorio-ensad | Transparencia ENSAD (UE 123 MINEDU) | 2026-07-04 | unimauro/observatorio-ensad | Igual | No territorial |
| observatorio-sanmarcos | Transparencia UNMSM (pliego 510) | 2026-07-04 | unimauro/observatorio-sanmarcos | Igual | No territorial. etl/conosce trae Excel CONOSCE adjudicaciones/consorcios 2023-25 (~18 MB c/u, nacionales) |
| observatorio-uni | Transparencia UNI | 2026-07-04 | unimauro/observatorio-uni | Igual | No territorial |
| observatorio-unsa | Transparencia UNSA (pliego 513) | 2026-07-04 | unimauro/observatorio-unsa | Igual | No territorial |
| observatorio-unsaac | Transparencia UNSAAC (pliego 511) | 2026-07-06 | unimauro/observatorio-unsaac | Igual | No territorial |
| observatorio-villarreal | Transparencia UNFV (pliego 524) | 2026-07-04 | unimauro/observatorio-villarreal | Igual | No territorial |
| observatorio-defensa-interior | Finanzas SIMA/FAME/SEMAN (FONAFE) | 2026-06-09 | unimauro/observatorio-defensa-interior | React+ECharts, backend, docker | **No**: README dice series financieras "ILUSTRATIVAS"; solo presupuesto verificado |
| observatorio-fonafe | Empresas públicas FONAFE | 2026-06-23 | unimauro/observatorio-fonafe | React+ECharts+Vite, backend Python | **No** (README: "Datos ilustrativos"). etl/cache/sunass_eps.json: 12 EPS con KPI SUNASS (referencia agua) |
| observatorio-idoneidad-estado | Idoneidad del personal del Estado | 2026-06-22 | unimauro/observatorio-idoneidad-estado | Python, parquet, dashboard | No territorial. web/data/sectores.json: presupuesto por sector (19) |
| observatorio-poder-economico | Grafo de grupos económicos | 2026-06-21 | unimauro/observatorio-poder-economico | React+Vite | **No** (README: "muestra semilla demostrativa") |
| observatorio-smartphones-adolescentes | Evidencia global smartphones/adolescentes | 2026-09-10 | unimauro/observatorio-smartphones-adolescentes | React+Vite | No: datos por país (28 filas), mayoría estimados |
| proyecto-inti | Gemelo digital 1,891 distritos | 2026-06-08 | unimauro/proyecto-inti | HTML estático, Supabase | **Mixto**: IDH 2019, pobreza, población 2020 reales (PNUD/INEI vía ubigeo-peru-aumentado). README: demás índices "**ilustrativos** (sintéticos…)" → NO reutilizar |
| peru-2076 | Libro estratégico nacional 2026-2076 | 2026-09-22 | unimauro/peru-2076 | Markdown, scripts | Sin datos: data/{BCRP,CEPAL,INEI,MEF,OECD} vacías |
| congreso-abierto-peru | Observatorio del Congreso | 2026-09-01 | unimauro/congreso-abierto-peru | Python pipeline, frontend, docker | No territorial: data/personal_congreso.csv (4,051 filas) |
| consalud (Medsage) | SaaS médico | 2026-08-05 | unimauro/consalud | React+Vite+Supabase | Sin datos |
| minsa-bot-wsp | Bot cupos MINSA/SIS | 2026-07-14 | **sin remoto** | Node/TS | Sin datos |
| essalud-bot-wsp | Bot cupos EsSalud | 2026-08-05 | unimauro/essalud-bot-wsp | Node/TS, docker | data/sedes.json: 12 sedes (marginal) |
| universidades-peru | Ranking investigación (OpenAlex) | 2026-07-05 | unimauro/universidades-peru | HTML estático, ETL Python | No territorial: caché OpenAlex, sjr_journals.parquet 47 MB |
| geolocation | API Rails de geolocalización | 2024-06-11 | unimauro/geolocation | Rails, docker | Sin datos |
| iucn-flr-plataforma-conocimiento-2026 | Propuesta IUCN SUR | 2026-05-29 | unimauro/iucn-flr-plataforma-conocimiento-2026 | Markdown/PDF | Sin datos |
| caaap-repam-web | Renovación web CAAAP/REPAM | 2026-08-27 | unimauro/caaap-repam-web | Documentos | Sin datos tabulares |
| plan-peru-2050 (Documents) | Dashboard comisiones PP2050 | 2026-09-01 | unimauro/plan-peru-2050 | HTML+JS, SQLite | Clon **desactualizado**; usar ~/Repos |
| ~/Repos/plan-peru-2050 | Ídem, al día | 2026-09-24 | unimauro/plan-peru-2050 | HTML+JS, SQLite | **Sí** (§2). Cifras de comisiones "sujetas a validación"; no afecta territorial.json |
| ~/Repos/como-esta-lima | Dashboard Lima 2019-2026 | 2026-09-22 | unimauro/como-esta-lima | React+Vite+Leaflet | **Sí, solo Lima Metropolitana** |
| ~/Repos/evaluacion-mimp | Evaluación MIMP pliego 039 | 2026-09-09 | unimauro/evaluacion-mimp | Python, Excel | **Parcial, departamental** |
| ~/Repos/peru-transparente | Funcionarios, entidades, redes de poder | 2026-09-25 | unimauro/peru-transparente | React+Vite+MapLibre+ECharts, backend, docker | No territorial, sin UBIGEO. 1.43M filas de planillas, sanciones RNSSC (con DNI), contratos. PII: no reutilizar en observatorio público |

## 2. Archivos de datos territoriales

| Archivo | Tamaño | Filas/features | Campos clave |
|---|---|---|---|
| ~/Repos/plan-peru-2050/data/territorial.json | 998 KB | 1,894 UBIGEO (+25 deptos en `territorio`) | idh, pobreza, pobreza_extrema, poblacion, cobertura_agua/desague/electricidad/internet, vulnerabilidad_alimentaria, altitud_msnm, ide_agua/electricidad/salud, deficit_* (derivados = 100 − cobertura). Fuente: PNUD/INEI + qhaway corte 2026-08-21 |
| ~/Repos/plan-peru-2050/data/distritos.geojson | 802 KB | 1,826 polígonos | u (ubigeo), d, pr, dp, idh, pob, pex, p |
| ~/Repos/plan-peru-2050/data/pp2050.db | 52 KB | tablas indicador_hist, bot_queries, validaciones | No territorial |
| proyecto-inti/data/distritos.geojson | 1.8 MB | 1,834 polígonos | IDDIST, IDDPTO, IDPROV, NOMBDIST, NOMBPROV, NOMBDEP |
| proyecto-inti/data/indicadores.json | 222 KB | 1,894 UBIGEO | p (pob), i (IDH), t/e (pobreza/extrema), la, lo, al (altitud). Usar solo estos |
| proyecto-inti/data/territorio.json | 59 KB | depto → prov → [distrito, ubigeo] | Jerarquía UBIGEO |
| observatorio-ambiental-peruano/public/data/pasivos-hidrocarburos.geojson (+csv/) | 1.5 MB | 3,266 puntos | lote, tipo, anio, riesgo_salud/poblacion/ambiente, cuenca, departamento, provincia, distrito (sin UBIGEO) |
| …/suelos-empetrolados.geojson (+csv) | 1.5 MB | 3,233 puntos | locacion, yacimiento, administrado, estatus, area_m2, puntos_exceden |
| …/comunidades-campesinas.geojson | 657 KB | 5,043 puntos | nombre |
| …/comunidades-nativas.geojson | 349 KB | 1,600 puntos | nombre, etnia, poblacion, familias, rio |
| …/pueblos-indigenas.geojson | 564 KB | 2,275 puntos | nombre, tipo, etnia, familia_ling, federacion |
| …/monitoreo-indigena.geojson | 358 KB | 567 puntos | tipo_impacto, fuente_impacto, lote, empresa |
| …/unidades-mineras.geojson | 76 KB | 313 puntos | nombre, titular, sustancia, situacion, tipo (region en CSV) |
| …/riesgo-ambiental-oefa.geojson | 74 KB | 195 puntos | riesgo, peligro, vulnerabilidad, pasivo_minero, pasivo_hidrocarburo |
| …/relaves-oefa-puntos.geojson | 69 KB | 206 puntos | NOM_COMP, TIPO_COMP, estado_dr, administrado, area_m2 |
| …/mineria-ilegal-anp.geojson | 163 KB | 179 | descrip, ubiref, estado |
| …/pash-amazonia.geojson | 9 KB | 22 | departamento, provincia, distrito, riesgo_salud |
| …/planes-rehabilitacion-amazonia.geojson | 10 KB | 30 | sitio, cuenca, area_ha, costo_total_soles |
| …/oefa-isim-amazonia.geojson | 32 KB | 86 | punto, componentes, informe |
| …/anp-sernanp, lotes-petroleros, reservas-territoriales, oleoducto-norperuano, peru-departamentos | 19–160 KB | 104 / 78 / 12 / 4 / 25 | Capas de contexto |
| …/derrames.json | 4 KB | agregados | pasivosPorDepartamento, PorTipo, PorLote, PorCuenca |
| observatorio-ambiental-peruano/etl/fuentes/hidrocarburos-amazonia/BD_OEFA_{Agua,Suelo,Sedimento,Hidrobiologia}_Amazonia.xlsx + Diccionario | 87–364 KB | no contado | Monitoreo OEFA calidad agua/suelo; BD_Monitoreo_Ambiental_Indigena.xlsx |
| observatorio-ambiental-peruano/research/endpoints.json | 8 KB | 13 capas en uso, 7 candidatas | Catálogo de servicios oficiales (vivos y caídos) |
| ~/Repos/como-esta-lima/data/raw/mef_distritos_20{19..26}.csv | ~90 KB c/u | ~500 filas/año | anio, ubigeo, distrito, pliego, funcion, pia, pim, devengado. Solo Lima |
| ~/Repos/como-esta-lima/data/geo/lima_distritos.geojson | 387 KB | 43 polígonos | ubigeo, nombre |
| ~/Repos/como-esta-lima/data/raw/mef_mml_20{19..26}.csv | 3–4.7 MB c/u | 3.4k–5.7k filas | Formato crudo MEF Datos Abiertos (MML) |
| ~/Repos/evaluacion-mimp/01_data_cruda/violencia_por_departamento_desc2026-09-08.csv | 21 KB | 26 | departamento, anio, feminicidios, denuncias_violencia_sexual, atenciones_cem, vih_mujeres, fuente, url |
| ~/Repos/evaluacion-mimp/02_data_procesada/presupuesto_mimp_por_departamento.csv | 54 KB | 225 | anio, departamento_meta, pia, pim, devengado, ejecucion_pct_dev_pim |
| ~/Repos/evaluacion-mimp/01_data_cruda/{endes_prevalencia,embarazo_adolescente}_desc2026-09-08.csv | 7–10 KB | 33 / 22 | Series nacionales ENDES |
| observatorio-fonafe/etl/cache/sunass_eps.json | 4 KB | 12 EPS | KPI SUNASS por EPS |

## 3. NO reutilizables (sintético / ilustrativo / demo según README)

- proyecto-inti: todos los índices salvo IDH, pobreza, pobreza extrema, población.
- observatorio-fonafe y observatorio-defensa-interior: series financieras ilustrativas.
- observatorio-poder-economico: semilla demostrativa.
- observatorio-smartphones-adolescentes: mayoría estimados.
- observatorio-ambiental-peruano: capas marcadas `estimado`/`referencial` (revisar etiqueta por capa).
- peru-transparente: datos reales pero con PII (DNI, nombres).

## 4. TOP reutilizables

1. `/Users/unimauro/Repos/plan-peru-2050/data/territorial.json` — base distrital (1,894 UBIGEO) con IDH, pobreza, población, coberturas de servicios, IDE salud; fuente documentada.
2. `/Users/unimauro/Repos/plan-peru-2050/data/distritos.geojson` — 1,826 polígonos livianos con UBIGEO para coropletas.
3. `/Users/unimauro/Documents/Repos/proyecto-inti/data/distritos.geojson` — límites con IDs INEI (IDDIST/IDPROV/IDDPTO), alternativa más completa.
4. `/Users/unimauro/Documents/Repos/observatorio-ambiental-peruano/public/data/` — 20+ capas reales de contaminación y territorio (requieren unión espacial para UBIGEO).
5. `/Users/unimauro/Documents/Repos/observatorio-ambiental-peruano/etl/fuentes/hidrocarburos-amazonia/` — monitoreo OEFA agua/suelo/sedimento con diccionario.
6. `/Users/unimauro/Documents/Repos/observatorio-ambiental-peruano/research/endpoints.json` — catálogo de servicios oficiales vivos/caídos para el ETL.
7. `/Users/unimauro/Repos/como-esta-lima/data/raw/` — patrón ETL MEF por UBIGEO y función 2019-2026 (solo Lima, extensible).
8. `/Users/unimauro/Repos/evaluacion-mimp/01_data_cruda/violencia_por_departamento_desc2026-09-08.csv` — violencia/salud por departamento con fuente y URL por fila.
