# Metodología

## 1. Pregunta y postura
¿Existen asociaciones, a nivel distrital, entre exposición a contaminantes (metales en sedimentos, presión minera, hidrocarburos) y resultados sanitarios (mortalidad por causa) o educativos (ENLA 2024)? El observatorio **no presupone causalidad**. Clasifica cada afirmación en una escalera de evidencia: **A medido**, **B asociación estadística**, **C hipótesis**, **D sin datos**.

## 2. Unidad territorial
UBIGEO INEI de 6 dígitos sobre el geojson distrital simplificado (1 826 polígonos, `IDDIST`). Capas puntuales → punto-en-polígono (Shapely STRtree). SINADEF → cruce por nombres normalizados (su `COD_UBIGEO_DOMICILIO` sigue la codificación RENIEC, distinta de la INEI: p. ej. Cusco 07 vs 08). Resultado: 100 % de certificados con domicilio en Perú emparejados. Limitación: distritos creados después de la versión del geojson quedan fuera (53 de 1 639 en ENLA).

## 3. Variables ambientales
| Variable | Construcción | Umbrales de referencia |
|---|---|---|
| As, Hg, Pb, Cd, Cu en sedimentos | Por distrito: n, mediana, p90, máximo, % > PEL. `<LD` → LD/2 (se cuenta `n_ld`); `N.R.` → nulo; negativo → `<|v|` (convención de laboratorio); 0 exacto → nulo. Mediana solo con n ≥ 3. | Perú no tiene ECA de sedimentos. Se muestran CCME PEL (agua dulce: As 17, Hg 0,486 (=486 ppb), Pb 91,3, Cd 3,5 mg/kg) y ECA Suelo agrícola DS 011-2017-MINAM (As 50, Hg 6,6, Pb 70, Cd 1,4) **solo como referencia orientativa**. |
| REINFO | Conteo de registros por distrito y por 10 mil hab.; vigente/suspendido; beneficio/explotación | Registro administrativo, no actividad ni ilegalidad |
| PAM | Conteo; subconjunto "residuo minero" | Inventario MINEM |
| Unidades mineras, relaves, riesgo OEFA, pasivos e infraestructura de hidrocarburos, minería ilegal en ANP | Conteos | Inventarios |
| Agua superficial | 54 puntos con As, Hg, Pb, Cd (mg/L) | LMP DS 031-2010-SA / ECA Agua cat. 1-A1: As 0,010; Hg 0,001; Pb 0,010; Cd 0,003 mg/L |

## 4. Variables de resultado
- **Mortalidad** (SINADEF 2019–2025): causa básica ≈ último código CIE-10 no vacío en A→F. Grupos: renal N17–N19; hepática K70–K77; cáncer C00–D09 (piel C43–C44; vejiga/riñón C64–C68; pulmón C33–C34); T56 metales; T60 plaguicidas; L piel; G nervioso; P/Q perinatal-congénita; I; J; V–Y externas. Tasa cruda por 100 mil hab-año = Σ defunciones / (población × 7) × 10⁵, solo distritos ≥ 5 000 hab. **No estandarizada por edad** (pendiente población por edad distrital). Subregistro: las cifras son un piso.
- **Educación** (ENLA 2024 4.º primaria): % satisfactorio y % previo al inicio en lectura y matemática; cobertura de estudiantes y de IE por distrito. No se mezcla con ECE ni PISA.

## 5. Controles
Pobreza monetaria (INEI), altitud (INEI), log10 población, % viviendas con agua de red y % hogares con internet (Censo 2017). Faltan (pendientes): ruralidad, desnutrición, oferta sanitaria, lengua materna, gasto per cápita (disponible pero no usado como control por endogeneidad).

## 6. Análisis (`etl/analisis.py`)
Para cada par (9 ambientales × 12 resultados = 108): n; Pearson y Spearman con IC 95 % bootstrap (1 000 / 500 réplicas, semilla 42); correlación parcial (residuos de OLS sobre controles); OLS con errores robustos HC3, β, IC, R²; Spearman por departamento (n ≥ 15). Umbral de desactivación: n < 30. Matriz de Spearman pairwise con n por celda. Todo con `allow_nan=False`.

**Lectura de resultados:** con 108 pruebas, Bonferroni exige p < 0,00046. Ninguna correlación parcial supera |r| = 0,2. La asociación más consistente (As en sedimentos ↔ menor % satisfactorio en lectura y matemática, r parcial ≈ −0,15, n = 967) es débil, cambia de signo entre departamentos (Ica −0,48; Ayacucho +0,26) y es compatible con confusión geográfica (los distritos con muestreo INGEMMET están en la sierra minera). Nivel B, no C→A.

## 7. Sesgos y limitaciones declarados
- **Falacia ecológica**: asociaciones entre promedios distritales, no entre personas.
- **Sesgo de muestreo**: INGEMMET muestrea donde hay prospección mineral; la selva baja casi no tiene muestras.
- **Exposición ≠ contexto geoquímico**: sedimento de quebrada no es agua de consumo.
- **Rezago**: sedimentos 2000–2018 vs. resultados 2019–2025; no se modela latencia (cáncer 10–30 años).
- **Subregistro** y **codificación** en SINADEF; **cobertura** variable en ENLA.
- **Confusión residual**: pobreza y ruralidad dominan ambos resultados.
- **Comparaciones múltiples**.

## 8. Lo que no se hace (todavía)
Modelos espaciales (Moran's I, SAR/SEM), estandarización por edad, series temporales de exposición, imputación, ponderación por cobertura.

## 9. Reproducibilidad
Ver README. Semillas fijas; salidas JSON versionadas; pruebas `tests/test_datos.py`; ETL mensual en GitHub Actions (`.github/workflows/etl.yml`).
