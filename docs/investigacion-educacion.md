# Investigación de fuentes educativas con desagregación distrital / por IE

Informe verificado el 25-09-2026. Todas las URLs fueron probadas con `curl` (estado HTTP 200 salvo indicación).

## Notas técnicas de acceso

- `umc.minedu.gob.pe` tiene certificado HTTPS autofirmado: WebFetch falla; usar `http://` o `curl -k`.
- `datosabiertos.gob.pe` tiene un WAF que devuelve 418 a `curl` sin User-Agent de navegador; con UA de Chrome funciona.
- ESCALE (`escale.minedu.gob.pe`) responde bien; los archivos se sirven en `https://escale.minedu.gob.pe/documents/10156/<carpetaId>/<archivo>`.
- SICRECE `https://sicrece.minedu.gob.pe/` responde 200 (consulta interactiva por IE/UGEL; no se verificó descarga masiva). El host alterno `sistemas15.minedu.gob.pe:8888` no responde.

## 1) UMC-MINEDU — Bases de datos (http://umc.minedu.gob.pe/bases-de-datos/)

La página publica Excel agregados por estrato / DRE / UGEL / Distrito (NO por IE). Estructura verificada de los Excel distritales: una hoja por año; columnas `Código Geográfico` (ubigeo 6 dígitos, texto), `REGION`, `PROVINCIA`, `DISTRITO`, `Cobertura IE`, `Cobertura Estudiantes`, y % por nivel de logro para Lectura y Matemática (Previo al inicio / En inicio / En proceso / Satisfactorio; 2P sin "Previo al inicio"). Hoja `observaciones`: solo se reportan distritos con cobertura ≥90% de IE y ≥80% de estudiantes; el resto aparece con `-`.

| Grado | Dataset | URL exacta | Formato | Unidad | Años | Cobertura | Limitaciones | Estado |
|---|---|---|---|---|---|---|---|---|
| 4.° primaria | Nivel de desempeño distrital | http://umc.minedu.gob.pe/wp-content/uploads/2025/04/4.-Distrital-4P-2016-2018-2024-Nivel-de-desempeño.xlsx | xlsx | Distrito | 2016, 2018, 2024 (hojas: 1,730 / 1,764 / 1,645 filas) | Censal (ECE 2016, ECE 2018, ENLA 2024) | 2019, 2022, 2023 y 2025 fueron muestrales: solo nacional/estratos/DRE, sin UGEL ni distrito. UMC publica 4P 2016-2025 como una misma serie (comparable). | 200 |
| 4.° primaria | Medida promedio distrital | http://umc.minedu.gob.pe/wp-content/uploads/2025/04/4.-Distrital-4P-2016-2018-2024-medida-promedio.xlsx | xlsx | Distrito | 2016, 2018, 2024 | Censal | Ídem | 200 |
| 4.° primaria | UGEL | http://umc.minedu.gob.pe/wp-content/uploads/2025/04/3.-UGEL-4P-2016-2018-2024-Nivel-de-desempeño.xlsx (y `...-medida-promedio.xlsx`) | xlsx | UGEL | 2016, 2018, 2024 | Censal | | 200 |
| 4.° primaria | DRE | http://umc.minedu.gob.pe/wp-content/uploads/2026/05/2.-DRE-4P-2016-2025-Nivel-de-desempeño.xlsx | xlsx | DRE | 2016-2025 | Mixta | 2019/22/23/25 muestral | 200 |
| 2.° secundaria | Nivel de desempeño distrital | http://umc.minedu.gob.pe/wp-content/uploads/2020/06/4.-Distrital-2015-2019-2S-Nivel-de-desempeño.xlsx | xlsx | Distrito | 2015, 2016, 2018, 2019 (hojas Distrito_2015…2019, ~1,790 filas c/u) | Censal (ECE) | Lectura y Matemática en todos los años; 2016/2018/2019 traen columnas adicionales (HGE y/o CyT; 18-22 columnas, verificar cabecera). ÚLTIMO dato distrital de secundaria = 2019. | 200 |
| 2.° secundaria | Medida promedio distrital | http://umc.minedu.gob.pe/wp-content/uploads/2020/06/4.-Distrital-2015-2019-2S-Medida-Promedio.xlsx | xlsx | Distrito | 2015-2019 | Censal | | 200 |
| 2.° secundaria | UGEL | http://umc.minedu.gob.pe/wp-content/uploads/2020/06/3.-UGEL-2015-2019-2S-Nivel-de-desempeño.xlsx | xlsx | UGEL | 2015-2019 | Censal | | 200 |
| 2.° secundaria | DRE ciclo nuevo | http://umc.minedu.gob.pe/wp-content/uploads/2026/05/2.-DRE-2S-2023-2025-2S-Nivel-de-desempeño.xlsx | xlsx | DRE | 2023, 2025 | Muestral | Desde 2023 inicia ciclo NUEVO (se excluyó EIB de fortalecimiento): NO comparable con 2015-2022. | 200 |
| 2.° primaria | Nivel de desempeño distrital | http://umc.minedu.gob.pe/wp-content/uploads/2020/06/4.-Distrital-07-16-2P-Nivel-de-desempeño.xlsx | xlsx | Distrito | 2007-2016 (10 hojas, ~1,725-1,795 filas) | Censal | 2018 y 2023 muestrales sin DRE; 2019 y 2022 muestrales solo hasta DRE. Serie distrital termina en 2016. | 200 |
| 2.° primaria | Medida promedio distrital | http://umc.minedu.gob.pe/wp-content/uploads/2020/06/4.-Distrito-07-16-2P-medida-promedio.xlsx | xlsx | Distrito | 2007-2016 | Censal | | 200 |
| 4.° prim. EIB | Generales/DRE | http://umc.minedu.gob.pe/wp-content/uploads/2024/05/2.-DRE-4EIB-2023-nivel-de-desempeño.xlsx | xlsx | DRE | 2023 | Censal EIB | Ciclo nuevo 2023, no comparable con 2012-2018. Sin distrito. | 200 |
| PISA | Resultados Perú | http://umc.minedu.gob.pe/wp-content/uploads/2026/09/Resultados-PISA-Perú.xls | xls | Nacional / sexo / gestión | 2000-2025 | Muestral | Sin desagregación territorial | 200 |

### Respuestas directas

- **ENLA 2024 de 2.° secundaria distrital: NO EXISTE.** El reporte técnico (http://umc.minedu.gob.pe/wp-content/uploads/2026/05/RT_ENLA2024.pdf) confirma que ENLA 2024 solo evaluó 4.° primaria (censal) y 6.° primaria (muestral). No hubo 2.° secundaria en 2024.
- **ENLA 2023 distrital: NO EXISTE.** ENLA 2023 fue muestral en 2P, 4P y 2S (solo nacional/estratos/DRE) más 4P EIB censal (solo generales y DRE). Cero datos distritales o por UGEL para 2023.
- El archivo de 1,639 distritos que ya tenemos coincide con la hoja "Distrital ECE 2024 4P" (1,645 filas incl. cabeceras).
- **Comparabilidad:** 4P se publica como serie única 2016-2025 (mismo ciclo); 2S rompe en 2023; 4P EIB rompe en 2023; 2P la serie distrital solo llega a 2016.
- **Microdatos a nivel estudiante** (ZIP con SPSS/R): ECE 2016 (http://umc.minedu.gob.pe/wp-content/uploads/2017/04/4P_ECE_2016-2.zip, `.../2S_ECE_2016-3.zip`, `.../2P_MC_2016-1.zip`), ECE 2018 (http://umc.minedu.gob.pe/wp-content/uploads/2019/04/4P_ECE_2018-1.zip, `.../2S_ECE_18-1.zip`), 2019 (http://umc.minedu.gob.pe/wp-content/uploads/2020/06/2P_EM_2019.zip, `.../4P_EM_2019.zip`; 2S 2019 en Google Drive), ENLA 2023/2024/2025 en Google Drive (enlaces en http://umc.minedu.gob.pe/resultadosenla2024/: "ENLA censal 4P 2024.zip" https://drive.google.com/file/d/1F0iFVBdtY4jbriAsYe3lKSkLyI7jR4cq/view). Todos 200. No se verificó si los microdatos traen código modular/ubigeo.

## 2) ESCALE (Unidad de Estadística Educativa)

| Dataset | URL exacta | Formato | Unidad | Años | Licencia | Limitaciones | Estado |
|---|---|---|---|---|---|---|---|
| Padrón de Servicios Educativos (Padron_web) | https://escale.minedu.gob.pe/documents/10156/958881/Padron_web_20260918.zip (carpeta con versiones: https://escale.minedu.gob.pe/uee/-/document_library_display/GMv7/view/958881) | ZIP → `Padron_web.dbf` (287 MB, 180,859 registros, 45 campos) + `Instituciones_apoyo.dbf` + diccionario xlsx | Servicio educativo (COD_MOD + ANEXO), con CODLOCAL | Corte 18-09-2026; se actualiza semanalmente (versiones 28-ago, 2-sep, 9-sep, 18-sep) | "Acuerdo de uso de datos" en el xlsx (uso estadístico; ubicación proporcionada por DRE/UGEL; límites censales INEI) | Incluye INACTIVOS (~25% en muestra): filtrar `ESTADO=1`. Coordenadas `NLAT_IE`/`NLONG_IE` con 6 decimales (reales). Campos clave: `CODGEO` (ubigeo 6), `AREA_CENSO` (urbano/rural criterio INEI 2,000 hab.), `GESTION`/`GES_DEP`, `NIV_MOD`, `CODCP_INEI`, `D_DREUGEL`. DBF en codepage 437/850 (tildes rotas si se lee como latin1). | 200 |
| Censo Educativo — bases por IE/local (2004-2025) | Carpeta raíz: https://escale.minedu.gob.pe/uee/-/document_library_display/GMv7/view/10481 ; 2025: `.../view/10632985` (79 archivos) ; 2024: `.../view/9538443` (65 archivos). Descarga directa p.ej. https://escale.minedu.gob.pe/documents/10156/10632985/00_Padlocal.zip , `.../00_Padron.zip` , `.../01_Matricula_01.zip` , `.../04_Docente_01.zip` | ZIP con DBF + diccionarios PDF (https://escale.minedu.gob.pe/documents/10156/10632985/00_Diccionario%20de%20datos_LE_2025.pdf) | IE (COD_MOD) y Local educativo (CODLOCAL) | 2004-2025 | Sin licencia explícita (datos públicos MINEDU) | Servicios básicos por LOCAL: tablas `Loc_Lineal_1.dbf` con P321 (abastecimiento de agua: red pública/pilón/pozo…), P322-P328 (continuidad), saneamiento, energía eléctrica, internet (`Loc_P3230_Inter.dbf`). El listado web pagina 25 por página y no se pudo paginar por script: los ZIP de "Local educativo" 2025 están en las páginas 2-4 de la carpeta (nombres no verificados; abrir en navegador). Requiere procesar DBF. | 200 (carpeta y archivos probados) |
| Indicadores "Tendencias serie desde 2016" | Página: https://escale.minedu.gob.pe/ueetendencias2016 ; Excel: `https://escale.minedu.gob.pe/tendencias-2016-portlet/servlet/tendencias/archivo?idCuadro=<id>&tipo=excel` | .xls (BIFF, aunque el servidor lo nombre .xls/.xlsx; abrir con xlrd) con hojas Regional / Provincial / Distrital | Distrito (~1,890 filas con código 6 dígitos) SOLO en indicadores con fuente Censo Educativo/SIAGIE | Deserción interanual 2013-14 a 2024-25; atraso 2016-2025 | Sin licencia explícita | IDs verificados: 319 deserción interanual primaria, 321 secundaria, 317 inicial; 323/325/327 deserción permanente; 14 atraso escolar primaria total, 21 atraso secundaria total (15-20, 22-26 por grado); 1-13 repetidores; 121-199 aprobados/desaprobados/retirados; 335-345 traslados. Los indicadores con fuente ENAHO (asistencia 251-279, conclusión 439-459, deserción acumulada 115/117) NO tienen hoja distrital. Atraso: hasta 2021 fuente Censo Educativo, desde 2022 SIAGIE (quiebre de fuente). Deserción excluye emigrados. | 200 (probados 115, 253, 319, 321, 14, 21) |
| Reportes SIAGIE matrícula 2020-2025 | https://escale.minedu.gob.pe/uee/-/document_library_display/GMv7/view/8971472 | Carpeta | IE/grado/sección | 2020-2025 | | No descargado | 200 |

## 3) Datos abiertos (datosabiertos.gob.pe)

El grupo MINEDU tiene solo 12 datasets; NO hay ENLA ni ECE (la búsqueda devuelve vacío).

| Dataset | URL dataset / recurso CSV | Formato | Unidad | Años | Licencia | Limitaciones | Estado |
|---|---|---|---|---|---|---|---|
| Tasa y número de desertores primaria/secundaria 2023/2024 | https://www.datosabiertos.gob.pe/dataset/tasa-y-n%C3%BAmero-de-desertores-en-educaci%C3%B3n-primaria-y-secundaria-20232024 ; CSV primaria: https://www.datosabiertos.gob.pe/sites/default/files/Tasa%20y%20n%C3%BAmero%20de%20desertores%20en%20Educaci%C3%B3n%20Primaria%202023-2024.csv ; secundaria: `...Secundaria%202023-2024.csv` | CSV (coma) columnas `ubigeo, Departamento, Provincia, Distrito, desertor, denominador, Tasa` | Distrito | 2023→2024 | ODC-BY | ubigeo sin cero inicial (5 dígitos): rellenar a 6. Misma definición que ESCALE id 319/321. | 200 (con UA) |
| Matriculación y Trayectoria Estudiantil 2021-2024 | https://www.datosabiertos.gob.pe/dataset/matriculaci%C3%B3n-y-trayectoria-estudiantil-2021-2024 ; CSV 2024: https://www.datosabiertos.gob.pe/sites/default/files/Matriculaci%C3%B3n%20y%20Trayectoria%20Estudiantil%202024.csv (también 2021, 2022, 2023) | CSV | IE (cod_mod, anexo) × nivel × edad | 2021-2024 | ODC-BY | Trae TotalEstudiantes, Aprobado, Desaprobado, Retirado, Fallecido, tot_atraso, extranjeros, DNI. SIN ubigeo: unir con padrón por cod_mod. | 200 (con UA) |
| Número de matriculados EBR 2025 | https://www.datosabiertos.gob.pe/dataset/número-de-matriculados-de-educación-básica-regular-ebr ; CSV: https://www.datosabiertos.gob.pe/sites/default/files/N%C3%BAmero%20de%20matriculados%20de%20Educaci%C3%B3n%20B%C3%A1sica%20Regular%20%28EBR%29%202025.csv | CSV (;) | Servicio educativo | 2025 | ODC-BY | Trae CODGEO, AREA_CENSO, TALUM_HOM/MUJ/TALUM. `NLAT_IE`/`NLONG_IE` están TRUNCADAS a grados enteros (p.ej. `-6;-78`): inútiles para geo; usar coordenadas del padrón ESCALE. | 200 (con UA) |
| Listado de Servicios Educativos escolarizados | https://www.datosabiertos.gob.pe/dataset/listado-de-servicios-educativos-escolarizados ; CSV: https://www.datosabiertos.gob.pe/sites/default/files/Listado%20de%20Servicios%20Educativos%20escolarizados_2.csv | CSV (;) 29 campos | Servicio educativo | Corte 2026 (act. 01-04-2026) | ODC-BY | Sin coordenadas ni CODLOCAL; subconjunto del padrón ESCALE. | 200 (con UA) |
| Docentes de IE públicas 2024; Alumnos extranjeros y docentes 2024 | `/dataset/cantidad-de-docentes-de-ie-p%C3%BAblicas-nivel-nacional-por-%C3%A1rea-edad-sexo-grado-acad%C3%A9mico-y` | CSV/XLSX | IE | 2024 | ODC-BY | No inspeccionado | Listado verificado |

## 4) PISA 2022 Perú

- Fuente nacional: UMC, "El Perú en PISA 2022" capítulo 1: http://umc.minedu.gob.pe/wp-content/uploads/2023/12/PISA-2022-Capítulo-1.pdf (200). Nota OCDE: https://www.oecd.org/content/dam/oecd/en/publications/reports/2023/11/pisa-2022-results-volume-i-and-ii-country-notes_2fca04b9/peru_21d86e8b/3e71791c-en.pdf (200 con UA; la página HTML devuelve 403 a WebFetch).
- Muestra: 8,787 estudiantes seleccionados en 337 escuelas; 6,968 rindieron Matemática/Lectura/Ciencia; expandible a 499,075 estudiantes = 93.0% de la población elegible y 86.3% de los adolescentes de 15 años.
- Resultados 2022 vs 2018 (UMC): Lectura 401→408, Ciencia 404→408, Matemática cae 9 puntos (400→391). 34% alcanza nivel 2+ en matemática (OCDE 69%).
- Representatividad: el diseño es una muestra nacional bietápica estratificada; UMC y OCDE solo publican desagregación por sexo, gestión y área. **NO existen resultados por región/DRE ni por distrito**, y ninguno de los dos informes ofrece submuestra regional. No se pudo verificar el anexo A.2 (estratos explícitos de Perú) del reporte técnico OCDE, así que no se afirma cuáles fueron los estratos; sí se afirma que no hay estimaciones subnacionales publicadas. Conclusión: PISA solo sirve como referencia nacional en el observatorio.

## 5) Educación Intercultural Bilingüe — RNIIEE-EIB 2025

| Dataset | URL exacta | Formato | Unidad | Año | Licencia | Limitaciones | Estado |
|---|---|---|---|---|---|---|---|
| Registro Nacional de IIEE EIB 2025 | Página https://escale.minedu.gob.pe/registros-eib ; Excel: https://escale.minedu.gob.pe/c/document_library/get_file?uuid=9b9f8630-3f70-4a8b-941b-37c234e95536&groupId=10156 (archivo "RNIIEE EIB_2025.xlsx", 2.8 MB, 29,188 filas) ; norma RVM 154-2025-MINEDU: https://escale.minedu.gob.pe/c/document_library/get_file?uuid=ceca2b76-4db1-4ad7-bbe1-e923f3142baf&groupId=10156 (PDF) | xlsx | Servicio educativo (Código modular + Anexo + Código de local) | 2025 | Norma pública MINEDU | Campos: DRE, UGEL, código modular, anexo, código de local, nombre, nivel, departamento/provincia/distrito (solo NOMBRES, sin ubigeo: unir con padrón por COD_MOD para obtener CODGEO y coordenadas), centro poblado, Forma de atención EIB (fortalecimiento / revitalización / urbano), lengua originaria 1-3, Estado. Cabecera real en la fila 2. | 200 |

## Recomendación: qué descargar primero para el cruce distrital ambiente↔educación

1. **Padrón ESCALE** (`Padron_web_20260918.zip`). Es la llave de todo: ubigeo, coordenadas reales, área, gestión, nivel y estado por servicio y por local. Permite geolocalizar IE respecto a fuentes de contaminación (buffers) y agregar a distrito. Filtrar `ESTADO=1` y `NIV_MOD` de EBR.
2. **UMC distrital 4P 2016-2018-2024 (nivel de desempeño) + 2S 2015-2019 (nivel de desempeño).** Logro distrital censal en primaria con tres cortes (tendencia 2016→2024) y secundaria hasta 2019; ambos con columnas de cobertura para filtrar distritos poco cubiertos. No hay nada distrital más reciente en secundaria.
3. **ESCALE tendencias idCuadro 319 y 321** (deserción interanual distrital primaria/secundaria 2013-2025) **y 14/21** (atraso escolar distrital 2016-2025). Serie larga, misma fuente SIAGIE, ~1,890 distritos; complementa y supera al CSV de datos abiertos 2023/24 (que solo tiene un año).

Segunda ola: Censo Educativo 2025 tablas de Local educativo (agua/desagüe/electricidad/internet por CODLOCAL) para un índice de servicios básicos escolares por distrito, y RNIIEE-EIB 2025 para marcar distritos con oferta EIB (variable de control relevante en el cruce).

### Advertencias transversales

- ubigeo como texto de 6 dígitos (datos abiertos lo entrega en 5).
- Los Excel UMC ocultan distritos con baja cobertura (`-`).
- ECE/ENLA miden % de estudiantes por nivel de logro (no promedios comparables entre grados).
- Los indicadores con fuente ENAHO no bajan de región.
- Los DBF de ESCALE usan codepage DOS (leer con encoding cp850/cp437).
