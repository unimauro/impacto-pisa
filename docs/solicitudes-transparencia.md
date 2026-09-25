# Informe de datos faltantes y solicitudes de acceso a la información pública

Fecha: 2026-09-25. Marco legal: Ley N.º 27806 (Texto Único Ordenado, DS 021-2019-JUS), art. 10 y 11: toda entidad debe entregar información en el formato en que la posee; plazo de 10 días hábiles, prorrogable por única vez.

## Matriz de disponibilidad (resumen)

| Variable | Fuente que la tiene | Publicada como dato abierto | Nivel disponible | Brecha |
|---|---|---|---|---|
| As, Hg, Pb, Cd en **sedimentos** | INGEMMET | Sí (ArcGIS REST) | punto (28 184) | Amazonía baja sin muestreo; sin fecha por muestra |
| Metales en **agua superficial** | ANA (monitoreo por cuenca), INGEMMET | ANA: solo PDF; INGEMMET: 54 puntos | punto | Microdato ANA |
| Metales en **agua de consumo** | DIGESA/DIRESA (vigilancia), SUNASS (EPS) | No | sistema de abastecimiento | Microdato DIGESA |
| **Biomarcadores** (Pb/Hg/As en sangre, orina, cabello) | INS-CENSOPAS, DIRESA, estudios académicos | Publicaciones aisladas | localidad / muestra | Base consolidada |
| **Intoxicación por metales** (vigilancia epidemiológica) | CDC-MINSA (Directiva 069) | Sala situacional en PDF | distrito-año | Microdato/tabla abierta |
| **Morbilidad ambulatoria** por CIE-10 | MINSA HIS | Parcial (datosabiertos, años sueltos) | distrito | Serie completa |
| **Anemia / DCI** | INS-CENAN SIEN | Tablas por distrito (Excel) | distrito | Integración pendiente |
| **Mortalidad** por causa | MINSA SINADEF | Sí | certificado | Ubigeo en formato RENIEC |
| **ENLA 2024** 4.º prim. | UMC-MINEDU | Sí (Excel) | distrito (1 639) | 2.º sec. distrital; ECE 2016–19 |
| **REINFO** | MINEM DGFM | Sí (GEOCATMIN) | punto/registro | Historial de cambios de estado |
| **Pasivos mineros** | MINEM DGM | Sí (GEOCATMIN); RM anual en PDF/Excel | punto | Nivel de riesgo y año en la capa |
| **Minería ilegal** (áreas) | OEFA PIFA `REINFO/SERV_MIN_ILEGAL_AREA`, SERNANP (solo ANP), MAAP | Parcial | polígono | Capa nacional accesible |
| **Derrames** por evento | OEFA / OSINERGMIN | No (474 eventos 2000–2019 solo en informe CNDDHH) | evento | Base de emergencias |
| **Pesticidas** en agua/suelo | SENASA, ANA | No | — | Cualquier dato |
| **Población por edad** distrital | INEI | Sí (proyecciones) | distrito | Integración para estandarizar tasas |

## Solicitudes listas para presentar

### 1. Autoridad Nacional del Agua (ANA)
Solicito, en formato CSV o Excel, la base de datos de resultados del monitoreo participativo y de vigilancia de la calidad de agua superficial 2015–2026, con: código y coordenadas del punto, cuenca, fecha de muestreo, parámetro, valor, unidad, límite de detección, método analítico, laboratorio, categoría ECA aplicable. Fundamento: art. 10 Ley 27806; la información existe (informes técnicos por cuenca publicados en PDF).

### 2. DIGESA y DIRESA (Loreto, Ica, Puno, Madre de Dios)
Solicito la base de datos de vigilancia de la calidad del agua para consumo humano 2015–2026 por sistema de abastecimiento: localidad (ubigeo), tipo de fuente, fecha, parámetros fisicoquímicos (arsénico, plomo, mercurio, cadmio, cloro residual, turbidez) y microbiológicos, con valores y unidades; y el padrón de sistemas de abastecimiento con coordenadas. Para Loreto: resultados de arsénico en pozos y fuentes de la cuenca del Nanay y del distrito de San Juan Bautista / Iquitos (incluye Puerto Almendra).

### 3. Centro Nacional de Epidemiología (CDC-MINSA)
Solicito la tabla de notificaciones de exposición e intoxicación por metales pesados y metaloides (Directiva Sanitaria N.º 069-MINSA/DGE) 2012–2026, agregada por distrito de residencia, año, metal, tipo (exposición/intoxicación), grupo de edad y sexo, con el valor de laboratorio cuando exista (sin identificadores personales).

### 4. Instituto Nacional de Salud (INS-CENSOPAS)
Solicito los resultados agregados por localidad y año de las campañas de dosaje de plomo, mercurio, arsénico y cadmio en población 2010–2026 (n, media, mediana, % sobre valor de referencia), y la lista de informes técnicos correspondientes.

### 5. MINSA — Oficina General de Tecnologías de la Información (HIS)
Solicito los registros de atenciones de consulta externa HIS 2016–2026 agregados por distrito del establecimiento, año, capítulo y código CIE-10 de tres caracteres, grupo de edad y sexo (sin identificadores).

### 6. MINEM — Dirección General de Formalización Minera / Dirección General de Minería
Solicito (a) el historial de cambios de estado de los registros REINFO (fecha de inscripción, suspensión, exclusión, reincorporación) por código de registro; (b) el inventario de pasivos ambientales mineros vigente en Excel con año de identificación, nivel de riesgo, estado de gestión (remediación, reaprovechamiento) y responsable.

### 7. OEFA
Solicito la base de emergencias ambientales atendidas 2011–2026 (hidrocarburos, minería, otros) con fecha, ubicación (coordenadas y ubigeo), administrado, tipo, volumen o área afectada, componente ambiental y estado del expediente; y el acceso desde IPs de datacenter (o descarga directa) de las capas de PIFA `REINFO/SERV_MIN_ILEGAL_AREA`, `CONFLICTOS`, `VIG_MON` y `RRSS`.

### 8. MINEDU — UMC
Solicito los resultados de la ENLA 2024 de 2.º de secundaria y de la ENLA 2023 a nivel distrital (mismo formato que 4.º de primaria), y los de la ECE 2016, 2018 y 2019 por distrito, con cobertura de estudiantes e instituciones por distrito.

### 9. INEI
Solicito las proyecciones de población distrital por grupo quinquenal de edad y sexo 2017–2026 (base Censo 2017) en CSV, y el mapa de pobreza distrital 2018 con intervalos de confianza.

### 10. SENASA / MINAGRI
Solicito los resultados de monitoreo de residuos de plaguicidas en agua, suelo y alimentos 2015–2026 por localidad y principio activo.

## Cómo presentar
- Mesa de partes virtual de cada entidad (gob.pe) o formulario de acceso a la información. Adjuntar DNI. Indicar «formato digital abierto (CSV/Excel)» y correo de entrega.
- Registrar número de expediente y fecha en `docs/solicitudes-registro.csv` (crear al primer envío).
