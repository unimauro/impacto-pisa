# Observatorio Perú — Contaminación, salud y educación por distrito

**Sitio:** https://unimauro.github.io/observatorio-peru/

Observatorio de datos abiertos que cruza, a nivel de distrito (UBIGEO), la geoquímica de sedimentos de INGEMMET (arsénico, mercurio, plomo, cadmio), los inventarios mineros del MINEM (pasivos ambientales y REINFO), las capas de OEFA/OSINERGMIN/SERNANP, la mortalidad por causa de SINADEF, los aprendizajes de la ENLA 2024 (UMC-MINEDU), indicadores socioeconómicos (INEI, PNUD) y el gasto público (SIAF-MEF). Su objetivo es **investigar** si existen asociaciones entre exposición ambiental y resultados sanitarios o educativos, y dejar claro qué está **medido**, qué es **asociación estadística**, qué es **hipótesis** y dónde **faltan datos**.

> Regla de oro: cero cifras inventadas. Ningún dato ausente se rellena con ceros; ninguna asociación se presenta como causalidad.

## Secciones
| Sección | Qué responde |
|---|---|
| Panorama | Mapa distrital con 22 variables (ambiente, salud, educación, socioeconómico) |
| Explorador territorial | Perfil completo de cada distrito: fuentes documentadas, laboratorio, mortalidad, ENLA, gasto, brechas |
| Relaciones | Dispersión, correlación simple y parcial, OLS robusto, heterogeneidad por departamento, matriz |
| Salud | Mortalidad por causa sobre presión minera; comparación expuestos vs. resto por quintil de pobreza |
| Agua segura | Puntos con metales en agua superficial vs. LMP/ECA; sedimentos como contexto; tecnologías |
| Brechas de información | Dónde hay mediciones y dónde no; datos que el Estado tiene y no abre |
| Estudios de caso | Puerto Almendra (Loreto), Nazca (Ica), Puno, Madre de Dios |
| Metodología y datos | Escalera de evidencia, procedimiento, catálogo de fuentes, descargas, cómo citar |

## Datos y resultados (resumen)
- 28 184 muestras de sedimento (INGEMMET, 2000–2018) asignadas a 1 276 distritos; 9 134 con As > 17 ppm (PEL).
- 6 122 pasivos ambientales mineros, 87 334 registros REINFO (23 816 vigentes), 313 unidades mineras, 3 266 pasivos de hidrocarburos.
- 75 273 análisis de As/Hg/Pb/Cd en agua superficial (OEFA 2014–2026) en 498 distritos: 26,7 % de los análisis de arsénico supera el ECA A1.
- 3 930 emergencias ambientales (OEFA), 77 mil ha de minería ilegal y 911 mil ha de minería informal identificadas por OEFA, intersectadas por distrito.
- 75 273 análisis de As/Hg/Pb/Cd en agua superficial (OEFA 2014–2026) en 498 distritos: 26,7 % de los análisis de arsénico supera el ECA A1.
- 3 930 emergencias ambientales (OEFA), 77 mil ha de minería ilegal y 911 mil ha de minería informal identificadas por OEFA, intersectadas por distrito.
- 1,19 millones de defunciones 2019–2025 (SINADEF) agregadas por distrito de domicilio y grupo de causa.
- ENLA 2024 (4.º primaria) en 1 586 distritos; serie ECE 2016/2018 (misma escala), ECE 2019 2.º secundaria, deserción y atraso escolar (ESCALE).
- 240 pares ambiente↔resultado analizados; ninguna correlación parcial supera |r| = 0,2. La señal ambiental, si existe, es pequeña frente a pobreza y ruralidad a esta escala.

## Estructura
```
etl/arcgis.py            descarga genérica ArcGIS REST (GEOCATMIN, PIFA…)
etl/sinadef_distrital.py agrega SINADEF por distrito (cruce por nombres: RENIEC ≠ INEI)
etl/build_distritos.py   integra todo por UBIGEO (punto-en-polígono) → app/public/data/*.json
etl/oefa_agua.py         OEFA agua superficial: As/Hg/Pb/Cd, UTM→WGS84, % sobre ECA por distrito
etl/educacion_extra.py   ECE 2016/2018/2019 y ESCALE deserción/atraso por distrito
etl/oefa_agua.py         OEFA agua superficial: As/Hg/Pb/Cd, UTM→WGS84, % sobre ECA por distrito
etl/educacion_extra.py   ECE 2016/2018/2019 y ESCALE deserción/atraso por distrito
etl/analisis.py          correlaciones, IC bootstrap, parciales, OLS HC3, matriz → analisis.json
tests/test_datos.py      pruebas de calidad (UBIGEO, rangos, unidades, JSON estricto, consistencia)
app/                     React 19 + TypeScript + Vite + Tailwind + Leaflet + ECharts (GitHub Pages)
docs/                    inventario de repos, solicitudes de transparencia, metodología
data/raw, data/processed insumos (los pesados no se versionan; ver .gitignore)
```

## Reproducir
```bash
python3 -m venv .venv && .venv/bin/pip install pandas pyarrow requests shapely numpy scipy statsmodels pytest
.venv/bin/python etl/arcgis.py                 # capas INGEMMET/MINEM → data/raw
.venv/bin/python etl/sinadef_distrital.py /ruta/SINADEF_DATOS_ABIERTOS.csv
.venv/bin/python etl/build_distritos.py && .venv/bin/python etl/analisis.py
.venv/bin/python -m pytest -q tests
cd app && npm ci && npm run dev
```

## Licencias
Código MIT. Datos procesados CC BY 4.0. Cada fuente conserva su licencia (INGEMMET, MINEM, OEFA, MINSA, MINEDU, INEI, PNUD, MEF). Sin datos personales: SINADEF se publica solo como conteos por distrito.

## Ecosistema
Reutiliza componentes y datos de [observatorio-ambiental-peruano](https://github.com/unimauro/observatorio-ambiental-peruano), [educacion-peru](https://github.com/unimauro/educacion-peru), [mortalidad-peru](https://github.com/unimauro/mortalidad-peru), [bullying-peru](https://github.com/unimauro/bullying-peru) y [qhaway-dashboard](https://github.com/unimauro/qhaway-dashboard) (FIEECS-UNI). Ver `docs/inventario-repositorios.md`.
