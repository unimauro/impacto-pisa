import { Titulo, Panel, Evidencia, Tabla, Seccion, Cargando, NIVEL } from '../components/ui'
import { useFuentes, useResumen, fmtInt } from '../lib/data'
const BASE = import.meta.env.BASE_URL
const REPO = 'https://github.com/unimauro/impacto-pisa'
export default function Metodologia() {
  const { data: f } = useFuentes(); const { data: res } = useResumen()
  return (
    <>
      <Titulo sub="Todo lo que muestra el observatorio se puede reproducir: fuentes con URL, ETL en Python, análisis en Python y datos procesados descargables.">Metodología, fuentes y descargas</Titulo>
      <Seccion titulo="La escalera de evidencia">
        <div className="grid gap-3 md:grid-cols-2">{(Object.keys(NIVEL) as (keyof typeof NIVEL)[]).map(k => <Panel key={k}><Evidencia n={k} /><p className="mt-2 text-sm">{NIVEL[k].d}</p></Panel>)}</div>
      </Seccion>
      <Seccion titulo="Cómo se construyen los datos">
        <ol className="list-decimal pl-5 text-sm space-y-2 max-w-3xl">
          <li><strong>Clave territorial:</strong> UBIGEO INEI de 6 dígitos con el geojson distrital (1 826 polígonos). Las capas puntuales (sedimentos, pasivos, REINFO, relaves, unidades) se asignan por punto-en-polígono; SINADEF se cruza por nombre de departamento, provincia y distrito porque su código de ubigeo sigue la codificación RENIEC.</li>
          <li><strong>Geoquímica:</strong> por distrito, n de muestras, mediana, p90, máximo y % de muestras sobre el PEL (CCME). Valores bajo el límite de detección se sustituyen por LD/2 solo para estadísticos de tendencia central; 'N.R.' es nulo. Mediana solo con ≥ 3 muestras.</li>
          <li><strong>Mortalidad:</strong> causa básica = último código CIE-10 no vacío en la cadena A→F. Grupos: renal N17–N19, hepática K70–K77, cáncer C00–D09 (y subgrupos piel C43–C44, vejiga/riñón C64–C68, pulmón C33–C34), intoxicación por metales T56, sistema nervioso G, perinatal/congénita P–Q. Tasa cruda = defunciones 2019–2025 / (población × 7) × 100 000; solo distritos ≥ 5 000 hab.</li>
          <li><strong>Educación:</strong> ENLA 2024 de 4.º de primaria tal como la publica UMC: % de estudiantes por nivel de logro y cobertura. No se mezcla con ECE 2016–2019 ni con PISA (no representativa por distrito).</li>
          <li><strong>Análisis:</strong> correlación de Pearson y Spearman con IC 95 % bootstrap (1 000 réplicas), correlación parcial y OLS con errores robustos HC3 controlando pobreza, altitud, log-población, agua de red e internet; heterogeneidad por departamento (n ≥ 15). Se desactiva todo par con menos de 30 distritos.</li>
          <li><strong>Lo que NO se hace:</strong> imputar datos, rellenar con ceros mediciones ausentes, estandarizar por edad (pendiente: población por edad distrital), modelos espaciales (pendiente: Moran's I y regresión con rezago espacial), rezagos exposición→efecto.</li>
        </ol>
      </Seccion>
      <Seccion titulo="Catálogo de fuentes" aside={<span className="text-sm text-ink2">{f ? `${f.length} fuentes` : ''}</span>}>
        {f ? <Tabla><thead><tr><th>Institución</th><th>Dataset</th><th>Unidad · años</th><th>Uso en el observatorio</th><th>Limitaciones</th><th>Estado</th></tr></thead><tbody>
          {f.map(x => <tr key={x.id}><td className="whitespace-nowrap">{x.institucion}</td><td><a className="underline" href={x.url} target="_blank" rel="noreferrer">{x.dataset}</a><div className="text-xs text-ink3">{x.formato} · {x.licencia}</div></td><td className="text-ink2">{x.unidad}<br />{x.anios}</td><td>{x.uso}</td><td className="text-ink2 text-xs">{x.limitaciones}</td><td className="text-xs">{x.estado}</td></tr>)}
        </tbody></Tabla> : <Cargando que="catálogo" />}
      </Seccion>
      <Seccion titulo="Descargas (datos procesados, CC BY 4.0)">
        <Panel><ul className="text-sm space-y-1.5">
          <li><a className="underline" href={`${BASE}data/distritos.json`}>distritos.json</a> — {res ? fmtInt(res.n_distritos) : '…'} distritos con todas las variables integradas (2,7 MB).</li>
          <li><a className="underline" href={`${BASE}data/analisis.json`}>analisis.json</a> — correlaciones, IC, parciales, OLS y matriz.</li>
          <li><a className="underline" href={`${BASE}data/puntos-sedimentos.json`}>puntos-sedimentos.json</a> — {res ? fmtInt(res.sedimentos.n) : '…'} muestras INGEMMET (As, Hg, Pb, Cd, año, ubigeo).</li>
          <li><a className="underline" href={`${BASE}data/puntos-pam.json`}>puntos-pam.json</a> — {res ? fmtInt(res.pam.n) : '…'} pasivos ambientales mineros.</li>
          <li><a className="underline" href={`${BASE}data/puntos-aguas.json`}>puntos-aguas.json</a> — 54 análisis de agua superficial.</li>
          <li><a className="underline" href={`${BASE}data/catalogo.json`}>catalogo.json</a> — catálogo de fuentes. <a className="underline" href={`${BASE}data/resumen.json`}>resumen.json</a> — KPIs y cobertura.</li>
          <li>Código, ETL (<code>etl/</code>), análisis (<code>etl/analisis.py</code>), pruebas y documentación: <a className="underline" href={REPO}>{REPO}</a>. Informe de datos faltantes y solicitudes de transparencia: <a className="underline" href={`${REPO}/blob/main/docs/solicitudes-transparencia.md`}>docs/solicitudes-transparencia.md</a>.</li>
        </ul></Panel>
      </Seccion>
      <Seccion titulo="Cómo citar">
        <Panel><p className="text-sm">Cárdenas, C. (2026). <em>Observatorio Perú: contaminación, salud y educación por distrito</em>. Versión {res?.generado?.slice(0, 10)}. {`https://unimauro.github.io/impacto-pisa/`}. Datos originales: INGEMMET, MINEM, OEFA, MINSA-SINADEF, UMC-MINEDU, INEI, PNUD, MEF.</p></Panel>
      </Seccion>
    </>
  )
}
