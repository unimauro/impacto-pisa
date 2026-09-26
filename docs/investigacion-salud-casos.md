# Investigación verificada: salud pública distrital y estudios de caso (Puerto Almendra, Nazca, Puno, Madre de Dios)

Fecha: 2026-09-25. Estado por fila: **VERIFICADO** = se abrió la fuente (página, PDF o abstract); **PARCIAL** = solo resumen de buscador, abrir antes de publicar; **NO ENCONTRADO** = se buscó y no existe o no se halló.

**Hallazgo transversal.** No existe microdato público de intoxicación por metales pesados (CIE-10 T56) por distrito. Lo que hay: vigilancia CDC de "expuestos" (tamizaje, 2020→), SINADEF (ubigeo de domicilio + causas A–F CIE-10) y SIEN (por establecimiento). HIS-MINSA público termina en 2016.

---

## A. Salud distrital

### A1. Vigilancia de metales pesados (CDC-MINSA)

| Fuente | URL | Año | Unidad territorial | Cifras clave | Limitaciones | Estado |
|---|---|---|---|---|---|---|
| NTS 111-2014-MINSA/DGE-V.01 (vigilancia epidemiológica de factores de riesgo por exposición e intoxicación por metales pesados y metaloides), RM 006-2015/MINSA | https://www.saludarequipa.gob.pe/desa/archivos/Normas_Legales/RM%20006-2015-%20MINSA%20Y%20NTS%20111-2014-MINSA-DGE-V.01%20VIGILANCIA%20EPIDEMIOLOGICA%20EN%20SALUD%20P%C3%9ABLICA.pdf | 2015 | Nacional | Norma de notificación | No es dato | PARCIAL |
| Directiva Sanitaria 126-MINSA/2020/DGIESP, RM 1026-2020/MINSA (abordaje integral de población expuesta) | https://busquedas.elperuano.pe/dispositivo/NL/1911872-1 | 2020 | Nacional | Procedimiento clínico | No es dato | PARCIAL |
| Tablero CDC "Sala EMP" | https://app7.dge.gob.pe/maps/sala_emp/ (anuncio: https://www.dge.gob.pe/portalnuevo/destacado/el-cdc-presenta-tablero-de-vigilancia-epidemiologica-por-exposicion-a-metales-pesados-y-metaloides-en-el-peru/) | 2020→, publicado 11-jul-2025 | Dpto/prov/distrito, edad, sexo, etnia | Casos notificados y tasas | App JS; sin descarga visible; requiere raspado con navegador | VERIFICADO (anuncio); tablero no inspeccionado |
| Sala situacional semanal SE 12-2025 | https://www.dge.gob.pe/portal/docs/vigilancia/sala/2025/SE12/metales.pdf (patrón `/sala/AAAA/SEnn/metales.pdf`) | 2025 | Dpto y distritos con notificación | 1,097 expuestos en 33 distritos, 20 provincias, 11 dptos + Callao; Piura 490 (44.7 %), La Libertad 191, Cajamarca 165, Tumbes 138; <12 años 52.4 %; mujeres 62.6 %; Madre de Dios 1; Loreto e Ica 0 | Caso = "expuesto sin manifestaciones clínicas"; depende de campañas; metales Pb, As, Hg, Cd | VERIFICADO (PDF) |
| Ficha de notificación | https://www.dge.gob.pe/portalnuevo/wp-content/uploads/2024/05/Ficha_Metalespesados.pdf | 2024 | Individual | Variables (distrito de residencia, metal, matriz) | — | PARCIAL |
| Datos abiertos CDC (usuario dge_minsa) | https://www.datosabiertos.gob.pe/users/dgeminsa | 2000-2022 | — | 11 datasets (SINADEF, COVID, leishmaniosis, malaria, EDA…) | Ningún dataset de metales pesados | VERIFICADO (no existe) |

**Demostrado:** existe tablero distrital 2020→ y PDFs semanales. **Hipótesis:** ninguna. **Falta:** dataset T56 descargable; alternativa = raspar tablero o solicitud de acceso a la información al CDC.

### A2. Anemia y desnutrición crónica por distrito

| Fuente | URL | Años | Unidad | Contenido | Limitaciones | Estado |
|---|---|---|---|---|---|---|
| SIEN (INS/CENAN) datos abiertos | https://www.datosabiertos.gob.pe/dataset/sien-sistema-de-informaci%C3%B3n-del-estado-nutricional-de-ni%C3%B1os-y-gestantes-per%C3%BA-inscenan | 2012 → I sem 2026 (act. 8-sep-2026) | Establecimiento (mapeable a distrito) | ZIP anuales: <5 años, 5-11, 12-17, gestantes; diccionario; peso, talla, edad, Hb | Ubigeo no explícito en la página; población atendida MINSA | VERIFICADO |
| REUNIS SIEN-HIS anemia | https://www.minsa.gob.pe/reunis/data/sien-hisminsa-anemia-5.asp | 2018→ | Dpto/prov/distrito | Anemia <36 m y gestantes | Sin descarga masiva evidente | PARCIAL |
| Sala situacional de anemia (CDC) | https://sala-anemia.dge.gob.pe/ | HIS 2024 + ENDES 2023-24 | Dpto y distrito | Determinantes | Tablero | PARCIAL |
| Indicadores multisectoriales de anemia | https://www.minsa.gob.pe/reunis/data/Indicadores_Multisectoriales_Anemia.asp | — | Distrito | — | — | PARCIAL |
| Dataset "Anemia" | https://datosabiertos.gob.pe/dataset/anemia | — | — | — | Fetch devolvió login | NO VERIFICADO |

### A3. SINADEF

| Fuente | URL | Años | Unidad | Columnas | Limitaciones | Estado |
|---|---|---|---|---|---|---|
| Información de fallecidos SINADEF | Página: https://www.datosabiertos.gob.pe/dataset/informaci%C3%B3n-de-fallecidos-del-sistema-inform%C3%A1tico-nacional-de-defunciones-sinadef-ministerio · CSV: https://drive.minsa.gob.pe/s/PigmdwnCGEdyqos/download · Diccionario: https://www.datosabiertos.gob.pe/sites/default/files/Diccionario_Datos_SINADEF.xlsx | 2017→ (act. 15-sep-2026) | Distrito de domicilio (código ubigeo) y de fallecimiento (nombre) | `N, DEPARTAMENTO_FALLECIMIENTO, PROVINCIA_FALLECIMIENTO, DISTRITO_FALLECIMIENTO, TIPO_CDEF, TIPO_SEGURO, SEXO, TIEMPO_EDAD, EDAD, ESTADO_CIVIL, NIVEL_DE_INSTRUCCION, ETNIA, COD_UBIGEO_DOMICILIO, PAIS_DOMICILIO, DEPARTAMENTO_DOMICILIO, PROVINCIA_DOMICILIO, DISTRITO_DOMICILIO, FECHA, ANIO, MES, TIPO_LUGAR, INSTITUCION, MUERTE_VIOLENTA, NECROPSIA, DEBIDO_CAUSA_A, CAUSA_A_CIEX, … DEBIDO_CAUSA_F, CAUSA_F_CIEX` (cabecera leída del CSV real) | Preliminar; diccionario tras WAF; subregistro rural; T56 filtrable en causas A–F | VERIFICADO |
| "SINADEF: Certificado Defunciones" | https://datosabiertos.gob.pe/dataset/sinadef-certificado-defunciones | — | — | — | No actualizado desde feb-2022 (jmcastagnetto) | PARCIAL |

### A4. Morbilidad HIS-MINSA

| Fuente | URL | Años | Unidad | Contenido | Limitaciones | Estado |
|---|---|---|---|---|---|---|
| Dataset "MORBILIDAD" | https://datosabiertos.gob.pe/dataset/morbilidad | 2002-2016 (15 CSV) | ubigeo | ubigeo, CIE-10, edad, sexo, establecimiento | Termina 2016; tasas | VERIFICADO |
| Tablas maestras HISMINSA | https://datosabiertos.gob.pe/dataset/tablas-maestras-hisminsa | — | — | Catálogos | — | PARCIAL |
| REUNIS morbilidad HIS | https://www.minsa.gob.pe/reunis/data/morbilidad_HIS.asp | ~2016→ | Agregado | Consulta externa | Sin descarga masiva | PARCIAL |
| Búsquedas "morbilidad HIS" / "HIS consulta externa" en datosabiertos | https://www.datosabiertos.gob.pe/group/ministerio-de-salud-minsa | — | — | 0 resultados 2017+ | — | VERIFICADO (no existe microdato) |

**Conclusión:** no hay microdato HIS por CIE-10 × ubigeo 2017+ (renal N17-N19, hepática K70-K77, cáncer C00-C97). Vía: mortalidad SINADEF por distrito, o solicitud a OGTI-MINSA.

### A5. Registro de cáncer y GBD

| Fuente | URL | Años | Unidad | Cifras | Limitaciones | Estado |
|---|---|---|---|---|---|---|
| Registro de Cáncer de Lima Metropolitana vol. VI (INEN) | https://portal.inen.sld.pe/wp-content/uploads/2022/01/REGISTRO-DE-CANCER-DE-LIMA-METROPOLITANA-2013-2015.pdf (índice: https://portal.inen.sld.pe/registro-de-cancer-en-lima-metropolitana/) | 2013-2015 | 43 distritos Lima + 6 Callao | 70,162 casos incidentes; 32,572 muertes; figuras 30, 43, 52, 59, 66, 75, 84, 93, 102, 111, 120, 129 = mapas de tasas estandarizadas por distrito (todas, mama, estómago, cérvix, próstata, pulmón, colon, recto, tiroides, LNH, leucemia, SNC); rango hombres todas las loc. 73-620/100 mil | Coropletas por rango, no tablas; sin edición 2016+ | VERIFICADO (PDF) |
| Registros poblacionales INEN | https://www.gob.pe/institucion/inen/informes-publicaciones/8299322-vigilancia-epidemiologica-del-cancer-registros-poblacionales | varios | Lima, Trujillo, Arequipa | — | Solo 3 ciudades | PARCIAL |
| GBD/IHME subnacional | https://ghdx.healthdata.org/geography/peru (403) · lista GHELI: https://media.repository.gheli.harvard.edu/filer_public/29/a8/29a85f18-4173-4c87-9fcf-f979e819254f/2024_gheli_gbd-subnatanlyss.pdf · paper nacional GBD 2019: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10325574/ | 1990-2021 | Nacional | Perú no figura entre países con análisis subnacional | Jerarquía GBD 2021 no abierta (403) | PARCIAL (alta confianza) |

### A6. Biomarcadores (Pb, Hg, As)

| Estudio | URL | Año muestreo | Localidad | n | Resultado | Estado |
|---|---|---|---|---|---|---|
| Morales J, Fuentes-Rivera J, Bax V, Matta H. Arch Venez Farmacol Ter 2018;38(2):135-144 | https://www.redalyc.org/journal/559/55960422012/html/ | 2017 | Mi Perú, Callao | 310 niños 1-13 a | Pb sangre mediana 7.40 µg/dL; 27.4 % ≥10; 81.9 % ≥5 | VERIFICADO |
| Plomo en recién nacidos de La Oroya (RPMESP 2008) | http://www.scielo.org.pe/scielo.php?script=sci_arttext&pid=S1726-46342008000400002 | 2004-05 | La Oroya | 93 RN | Media 8.84 µg/dL; 24.7 % >10 | PARCIAL |
| Niños aledaños a relaves (RPMESP 2009) | http://www.scielo.org.pe/scielo.php?script=sci_arttext&pid=S1726-46342009000100004 | ~2005 | no capturada | — | Media 15.79 µg/dL; 84.7 % >10 | PARCIAL |
| Ale-Mauricio DA, Villa G, Gastañaga MC. RPMESP 2018;35(2) | http://www.scielo.org.pe/scielo.php?script=sci_arttext&pid=S1726-46342018000200002 | 2017 | Cairani / Camilaca (Tacna) | 103 / 71 | As urinario mediana 601.6 vs 30.2 µg/g creat; 100 % vs 80.3 % ≥20; agua 680 vs 2 µg/L | VERIFICADO |
| Fano-Sizgorich D et al. Exposure and Health 2021;13 | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7870591/ | 2019 | Tacna, gestantes | 147 | As urinario GM 43.97 µg/L (P50 22.3); 70.25 % con agua ≥25 µg/L | VERIFICADO (abstract) |
| Pancán-Jauja (Junín), niños | https://enfispo.es/servlet/articulo?codigo=10687277 | s/f | Pancán | 100 | 83 % As urinario ≥35 µg/L; 37 % anemia | PARCIAL |
| Yard EE et al. J Med Toxicol 2012;8 | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3550269/ | jul-2010 | Huaypetue, MDD | 103 | Hg urinario GM 5.5 µg/g creat (0.7-151); MeHg sangre GM 2.7 µg/L | VERIFICADO (abstract) |
| Ashe K. PLoS One 2012;7:e33305 | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3306380/ | 2011 | MDD | — | Hg cabello mayor en zonas mineras que en Puerto Maldonado | VERIFICADO (abstract, sin cifras) |
| Fernandez LE, CAMEP (Carnegie) informe 1 | https://www.actualidadambiental.pe/wp-content/uploads/2013/09/Estudio-sobre-niveles-de-mercurio-en-poblaci%C3%B3n-de-Madre-de-Dios1.pdf | 2012 | Puerto Maldonado | 226 adultos | Media cabello 2.73 ppm; 77.9 % >1 ppm; rango 0.02-27.4; MEF 2.98; 60 % especies de pescado >0.30 ppm | VERIFICADO (PDF) |
| Feingold BJ et al. Environ Res 2020;183:108720 | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8299663/ | 2014-15 | 46 comunidades, MDD | 723 | Mediana 1.60 µg/g, media 2.24; 37.2 % >2.2; MEF 42.7 %; <5 a 20 % | VERIFICADO (abstract) |
| Koenigsmark F et al. IJERPH 2021;18:13350 | https://doi.org/10.3390/ijerph182413350 | 2014-15 | MDD | 287 | 81 % del Hg en cabello es MeHg | VERIFICADO (abstract) |
| Pettigrew SM et al. IJERPH 2022;19:6335 | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9142029/ | 2014 | MDD | 418 | As y Cd en uñas mayores en zonas ASGM | VERIFICADO (abstract) |
| Cohortes Amarakaeri (2020) y Conamad (2023); DIRESA MDD 2025 (El Comercio/Mongabay) | https://elcomercio.pe/tecnologia/ecologia/mercurio-en-la-sangre-la-huella-toxica-en-ninos-y-gestantes-de-madre-de-dios-en-peru-noticia/ | 2015-16 / ~2020 / 2025 | MDD | 164 niños / 198 pares madre-RN | 32.9 % niños > OMS (indígenas 4.1 mg/kg); 29 % madres > CDC, cordón 6.0 µg/L; 27 % Hg urinario > límite (2025) | PARCIAL (prensa) |
| CINCIA + FZS, Nanay-Pintuyacu | https://es.mongabay.com/2025/06/amenaza-mercurio-comunidades-indigenas-loreto-presenta-niveles-altos/ | 2024 | 6 comunidades, Loreto | 273 | 79 % >2.2 mg/kg; 37 % >10; niños 0-4 mediana 12.99; peces 14 % >0.5 mg/kg (n=284) | VERIFICADO |
| Piñeiro XF et al. Sci Rep 2021;11:22729 | https://pmc.ncbi.nlm.nih.gov/articles/PMC8611049/ | 2016, 2018 | Paragsha vs Carhuamayo (Pasco) | 78 + 16 | Pb cabello raíz 4.58 mg/kg (ref <0.10) | VERIFICADO |
| CENSOPAS Espinar (informe CooperAcción) | https://cooperaccion.org.pe/wp-content/uploads/2017/11/ESPINAR-Informe-sobre-salud-4-1.pdf | 2010-17 | Espinar | 180 orinas (2013) | ≥52 sobre OMS | PARCIAL |
| CDC/ATSDR Cerro de Pasco 2007 | https://elecochasqui.wordpress.com/wp-content/uploads/2009/05/cdc-exposiciones-a-metales-pesados-en-ninos-y-mujeres-en-edad-fertil-en-tres-comunidades-mineras-cerro-de-pasco-peru-21-de-mayo-e28093-4-de-julio-de-2007.pdf | 2007 | Cerro de Pasco | — | — | PARCIAL |
| Vital Strategies / Pure Earth, plomo infantil Perú | https://www.vitalstrategies.org/wp-content/uploads/Preventing-Childhood-Lead-Exposure-Assessing-the-Comprehensive-Approach-Capacity-in-Peru_ES.pdf | ~2023 | Nacional | — | — | PARCIAL |

---

## B. Puerto Almendra (San Juan Bautista, Maynas, Loreto)

| Fuente | URL | Año | Unidad | Cifras clave | Limitaciones | Estado |
|---|---|---|---|---|---|---|
| UNAP – CIEFOR Puerto Almendra | https://api-repositorio.unapiquitos.edu.pe/server/api/core/bitstreams/00d4eb41-1a1d-436e-9479-b44141c8cfe4/content | varios | Centro poblado | Margen derecha del Nanay, 21-22 km SO de Iquitos, 3°49'40"S 73°22'30"W, ~122 msnm; CIEFOR-UNAP desde 2001; Arboretum El Huayo | Sin población | PARCIAL |
| Población | https://censo2017.inei.gob.pe/resultados-definitivos-de-los-censos-nacionales-2017/ · https://es.wikipedia.org/wiki/Distrito_de_San_Juan_Bautista_(Maynas) | 2017 | Distrito | San Juan Bautista 127,005 hab.; Puerto Almendra es 1 de 94 centros poblados | Cifra del caserío NO encontrada | NO ENCONTRADO |
| de Meyer CMC et al. Sci Total Environ 2017;607-608 (DOI 10.1016/j.scitotenv.2017.07.059) | https://pubmed.ncbi.nlm.nih.gov/28763940/ | 2015-16 | Iquitos y Pucallpa | Acuíferos aluviales holocenos: As hasta 700 µg/L, Mn hasta 4 mg/L; alrededor de Iquitos: pH 4.2-5.5, Al hasta 3.3 mg/L; acuíferos antiguos/profundos buena calidad | Sin pozos por localidad en abstract | VERIFICADO (abstract) |
| de Meyer CMC et al. Sci Total Environ 2023;860:160407 | https://www.sciencedirect.com/science/article/pii/S004896972207509X · PDF: https://www.dora.lib4ri.ch/eawag/dload/eawag:26216/PDF/de_Meyer-2022-Hotspots_of_geogenic_arsenic_and-(published_version).pdf | 2016-19 | Perú y Brasil | 70 % pozos en llanura de canales y 20 % en llanura menos dinámica >10 µg/L As (máx. 430); ningún pozo fuera de llanuras de ríos ricos en sedimento ni en riberas de ríos pobres en sedimento supera 5 µg/L | El Nanay es río pobre en sedimento → predice As bajo | VERIFICADO (abstract) |
| phys.org (EGU 2018) | https://phys.org/news/2018-04-toxic-arsenic-amazon-basin.html | 2018 | Cuenca amazónica | 250 sitios; As hasta 70× OMS; Mn 15×; Al 3× | Divulgación | VERIFICADO |
| Estudios locales As en pozos de Iquitos (INS/UNAP/DIRESA) | — | — | — | — | No encontrados | NO ENCONTRADO |
| Bolisetty S, Rahimi A, Mezzenga R. Environ Sci: Water Res Technol 2021;7:2223 | https://pubs.rsc.org/en/content/articlelanding/2021/ew/d1ew00456e | 2019-20 | "tres regiones" del Perú | 28 hogares + 3 plantas comunitarias; agua cruda 11 µg/L a 1.1 mg/L As | Localidades no nombradas en abstract | PARCIAL |
| Planta de tratamiento en Puerto Almendra | https://peruconstruye.net/2026/05/25/obras-saneamiento-loreto/ · https://www.gob.pe/institucion/vivienda/noticias/1003434-iquitos-forma-parte-de-proyecto-grandes-ciudades-ministerio-de-vivienda-informa-alcances-de-megaobra-de-agua-potable-y-saneamiento | 2026 | Iquitos metropolitano | PTAP Sedaloreto >S/ 48 M; Grandes Ciudades S/ 863 M, 371,852 hab. | Nada específico de Puerto Almendra | NO ENCONTRADO |
| Mercurio cuenca Nanay (CINCIA/FZS) | ver A6 | 2024 | 6 comunidades aguas arriba | 79 % >2.2 mg/kg | No es Puerto Almendra | VERIFICADO |

**Demostrado:** As geogénico alto en llanuras de ríos con mucho sedimento; Al alto en arenas ácidas de Iquitos. **Hipótesis:** As en Puerto Almendra; la evidencia regional va en contra. Riesgos plausibles: Al/acidez y Hg en pescado. **Falta:** medición local, población del caserío, ubicación de las plantas del estudio ETH.

---

## C. Nazca (Ica)

| Fuente | URL | Año | Unidad | Cifras clave | Limitaciones | Estado |
|---|---|---|---|---|---|---|
| CooperAcción, plantas de beneficio MAPE | https://cooperaccion.org.pe/wp-content/uploads/2025/09/plantas-de-beneficio-mape.pdf | 2025 | Nodo costa andina sur | INGEMMET: 20 plantas en Nasca, 28 en Caravelí, 63 en el nodo; plantas no registradas al sur de la ciudad de Nasca | Sin Hg/CN por planta | VERIFICADO (PDF) |
| Megaoperativo SUNAT/PNP/FEMA | https://www.infobae.com/peru/2025/05/30/incautan-mas-de-300-toneladas-de-insumos-y-minerales-en-megaoperativo-contra-mineria-ilegal-en-nasca/ | 29-may-2025 | Vista Alegre y El Ingenio | 10 plantas; 302 t (70 t CaO, 41 t Ca(OH)2, 188 t mineral de cobre, 50 kg soda cáustica); 258 camiones | No menciona Hg | VERIFICADO |
| Protesta de agricultores (Correo) | https://diariocorreo.pe/edicion/ica/nasca-agricultores-protestan-contra-planta-de-mineria-informal-que-danaria-cultivos-noticia/ | 23-abr-2026 | Km 13 Nasca-Puquio (Tierras Blancas) | Planta "El Olivar Imperial"; relaves con cianuro a 100 m del río; ~1,800 agricultores; DREM Ica, FEMA | Prensa | VERIFICADO |
| Kuramoto J. (GRADE/IIED) | https://www2.congreso.gob.pe/sicr/cendocbib/con4_uibd.nsf/3AE3C036E9E73AE905257A52006C0DD2/$FILE/mineria-artesanal-e-informal-en-e-peru.pdf | 2001 | Tulín, Saramarca | Quimbaletes en el pueblo; refogueo; Saramarca ~500 hab. | Desactualizado | PARCIAL |
| Directorio MINEM plantas | http://intranet2.minem.gob.pe/web/mineria/DIRECTORIO/DIRECTORIO/PLANTASBENEFICIONEW/plantas.asp | — | — | Página dinámica, sin filas de Ica en fetch | — | NO VERIFICADO |
| Hg aire/suelo/sangre EN NASCA | — | — | — | Ninguno. Cercano: Secocha (Arequipa) suelo 86.11 / 43.81 / 9.53 mg/kg (Mining 2024;4(2):22, https://www.mdpi.com/2673-6489/4/2/22) | Secocha ≠ Nasca | NO ENCONTRADO / PARCIAL |
| CDC metales pesados SE 12-2025 | ver A1 | 2025 | Departamento | Ica: 0 notificados | — | VERIFICADO |
| UNICEF/DIRESA Ica, anemia | https://www.unicef.org/peru/media/20316/file/An%C3%A1lisis%20situacional%20de%20la%20anemia%20en%20Ica_Versi%C3%B3n%20final%20julio%202025.pdf.pdf | 2025 (datos 2024) | Provincia | Niños: Nazca 1,351/6,979 = 19.4 % (DIRESA 9.5 %); gestantes Nazca 21.0 % (217/1,034) | Población atendida | VERIFICADO (PDF) |
| ENLA 2024 (UMC) | http://umc.minedu.gob.pe/resultadosenla2024/ · http://umc.minedu.gob.pe/wp-content/uploads/2026/05/RT_ENLA2024.pdf · SICRECE | 2024 | UGEL Nasca | Reportes por UGEL vía DRE Ica | Cifras no extraídas | PARCIAL |

**Demostrado:** polo de plantas informales, intervenciones 2025-26, mayor anemia de Ica. **Hipótesis:** exposición humana a Hg. **Falta:** cualquier medición ambiental o biomarcador en la provincia; ENLA por UGEL.

---

## D. Puno y Madre de Dios

| Fuente | URL | Año | Unidad | Cifras clave | Limitaciones | Estado |
|---|---|---|---|---|---|---|
| Calcina-Benique ME et al. DYNA 2022;89(221):178-184 | https://www.redalyc.org/journal/496/49672735020/html/ | 2015-18 | Callacame, Desaguadero (Puno) | 32 pozos: As 3-446 µg/L, media 64; 4/32 >100 µg/L; suelos 10-42.7 mg/kg | Muestreo estacional | VERIFICADO |
| Calcina Benique M, Apaza Campos R. Rev. Ciencias Naturales UNA-Puno 2019;1(1):1-11 | https://revistas.unap.edu.pe/rccnn/index.php/rccnn/article/download/248/257/615 | 2016 | Callacame | As 1.4-446 µg/L; cita Huata y Carancas hasta 500 µg/L y 96 % >10 µg/L | Huata/Carancas son cifras citadas | VERIFICADO (PDF) |
| Apaza Quispe TL, tesis UPeU 2020 | https://repositorio.upeu.edu.pe/items/4116b3e0-ff40-485a-ac0c-9198cddad39a | 2019 | Santa Adriana y Niño San Salvador, Juliaca | 28 puntos, 100 % >10 µg/L | Tesis | VERIFICADO |
| Mestas Mora TN, tesis UPSC 2023 | https://repositorio.upsc.edu.pe/handle/UPSC/1278 | 2023 | Taparachi, Juliaca | 2 pozos >50 µg/L | n=2 | VERIFICADO |
| Remoción As(III) Juliaca (TyCA) | https://revistatyca.org.mx/index.php/tyca/article/download/3777/2828/21379 | — | Juliaca | 451 µg/L | No abierto | PARCIAL |
| Madre de Dios: Yard 2012, CAMEP 2013, Feingold 2020, Koenigsmark 2021, Pettigrew 2022, cohortes, DIRESA 2025 | ver A6 | 2010-25 | MDD | ver A6 | — | VERIFICADO |
| Szponar N et al. Environ Sci Technol 2025;59 (DOI 10.1021/acs.est.4c10521) | https://pubs.acs.org/doi/10.1021/acs.est.4c10521 | 2019-22 | MDD | GEM 1.3-11 ng/m³ regional; 10 a >5,000 ng/m³ junto a minas/tiendas de oro; >70 % origen ASGM | Muestreo pasivo | VERIFICADO (abstract) |
| La República, Hg en aire urbano MDD | https://larepublica.pe/sociedad/2026/09/11/mineria-en-madre-de-dios-tiendan-de-oro-emiten-el-93-del-mercurio-detectado-en-el-aire-de-zonas-urbanas-614349 | 2025 | MDD | 93 % desde tiendas de oro | Prensa | PARCIAL |
| Base Mongabay Latam (39 estudios) | https://elcomercio.pe/tecnologia/ecologia/mercurio-en-la-sangre-la-huella-toxica-en-ninos-y-gestantes-de-madre-de-dios-en-peru-noticia/ | 2026 | 102 comunidades Perú | 3,380 muestras; 78.4 % sobre OMS; MINSA 2026 S/ 433,955 para expuestos | Prensa | PARCIAL |

**Demostrado:** As geogénico en altiplano de Puno; Hg humano en MDD en ≥8 estudios revisados por pares. **Hipótesis:** magnitud de exposición humana a As en Puno (sin biomarcadores locales). **Falta:** As en orina en Juliaca/Desaguadero; datos DIGESA de agua de pozo por distrito.

---

## Advertencias
1. datosabiertos.gob.pe y drive.minsa.gob.pe tienen WAF (bloquea curl al xlsx); descargar con navegador.
2. ScienceDirect, PubMed, MDPI, GHDx y RSC devuelven 403; se usaron Europe PMC y PDFs libres.
3. Ninguna cifra es inventada; las filas PARCIAL deben abrirse antes de publicarse.
