import { Titulo, Panel, Evidencia, Aviso, Cargando, Tabla, Seccion } from '../components/ui'
import { useData, fmtInt } from '../lib/data'

interface Revision { fecha: string; fuentes: { id: string; institucion: string; dataset: string; url: string; http: number | string | null; ok: boolean }[]; fuentes_ok: number; fuentes_total: number; tests: { resultado: string; ok: boolean; lista: string[] }; datos_generados: string; conteos: Record<string, number | null>; como_reportar: string }
const PROYECTOS = [
  { n: 'Observatorio Ambiental Peruano', u: 'https://unimauro.github.io/observatorio-ambiental-peruano/', d: '20 capas oficiales (SERNANP, OEFA, MINEM, Perupetro, Cultura) y el grupo Amazonía: sitios impactados por hidrocarburos con monitoreo indígena. Es el catálogo de capas que este observatorio reutiliza.', rel: 'Capas ambientales y catálogo de endpoints' },
  { n: '¿De qué morimos en el Perú?', u: 'https://unimauro.github.io/mortalidad-peru/', d: 'SINADEF 2017–2026 con tasas estandarizadas por edad, tendencias y tres ejes de prevención.', rel: 'Pipeline de causa básica y microdato SINADEF' },
  { n: 'Educación Perú', u: 'https://unimauro.github.io/educacion-peru/', d: 'Radiografía de la educación básica: ENLA 2024 por distrito, brechas, docentes y presupuesto.', rel: 'ENLA 2024 distrital' },
  { n: 'QHAWAY 2.0 (FIEECS-UNI)', u: 'https://unimauro.github.io/qhaway-dashboard/', d: 'Presupuesto público SIAF-MEF por distrito, pisos altitudinales, riesgos y prosperidad territorial.', rel: 'Indicadores socioeconómicos y gasto por distrito' },
  { n: 'Observatorio de Bullying', u: 'https://unimauro.github.io/bullying-peru/', d: 'Violencia escolar con datos SíseVe, ENARES y Defensoría, por distrito.', rel: 'Geojson distrital y regla registro ≠ exposición' },
  { n: '¿Cómo está Lima?', u: 'https://unimauro.github.io/como-esta-lima/', d: 'Lima 2019–2026 con 230 series MEF, INEI y ATU.', rel: 'Metodología de series verificadas' },
  { n: 'Radar LATAM', u: 'https://unimauro.github.io/latam-vivienda/', d: 'Vivienda, salarios y pagos en 14 ciudades de la región.', rel: 'Comparación territorial' },
]
const APOYO = [{ t: 'Yape', v: '940584307' }, { t: 'Plin', v: '940584307' }, { t: 'PayPal', v: 'paypal.me/unimauro', u: 'https://www.paypal.com/paypalme/unimauro' }]
export default function Ecosistema() {
  const { data: rev } = useData<Revision>('revision.json')
  return (
    <>
      <Titulo sub="Este observatorio es una pieza de una red de tableros ciudadanos que comparten datos, código y reglas: cero cifras inventadas, fuente en cada dato y ausencia de dato distinta de ausencia de problema.">Ecosistema, revisión de datos y apoyo</Titulo>
      <Seccion titulo="Observatorios relacionados">
        <div className="grid gap-3 md:grid-cols-2">{PROYECTOS.map(p => <Panel key={p.u}><a className="font-medium underline decoration-line hover:decoration-ink" href={p.u} target="_blank" rel="noreferrer">{p.n}</a><p className="mt-1 text-sm">{p.d}</p><p className="mt-1 text-xs text-ink2">Lo que aporta aquí: {p.rel}</p></Panel>)}</div>
      </Seccion>
      <Seccion titulo="Revisión de datos y fuentes" aside={rev && <Evidencia n={rev.tests.ok && rev.fuentes_ok === rev.fuentes_total ? 'A' : 'B'}>{rev.tests.ok ? 'pruebas OK' : 'pruebas con fallos'} · {rev.fuentes_ok}/{rev.fuentes_total} fuentes responden</Evidencia>}>
        {rev ? <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            <Tabla><thead><tr><th>Institución</th><th>Dataset</th><th className="text-right">HTTP</th><th>Estado</th></tr></thead><tbody>
              {rev.fuentes.map(f => <tr key={f.id}><td className="whitespace-nowrap">{f.institucion}</td><td><a className="underline" href={f.url} target="_blank" rel="noreferrer">{f.dataset}</a></td><td className="text-right tabular-nums">{String(f.http ?? '—')}</td><td>{f.ok ? <span className="text-agua">responde</span> : <span className="text-mina">no responde</span>}</td></tr>)}
            </tbody></Tabla>
            <p className="mt-2 text-xs text-ink2">Comprobación automática realizada el {rev.fecha.slice(0, 16).replace('T', ' ')}. Algunos portales del Estado bloquean peticiones automáticas (418/403) aunque funcionen en el navegador.</p>
          </div>
          <div className="space-y-3">
            <Panel><div className="text-sm text-ink2">Pruebas de calidad de datos</div><div className="font-display text-2xl">{rev.tests.resultado}</div><ul className="mt-2 text-xs space-y-1 list-disc pl-4">{rev.tests.lista.map(l => <li key={l}>{l}</li>)}</ul></Panel>
            <Panel><div className="text-sm text-ink2">Versión de datos</div><div className="text-sm">Generados el {rev.datos_generados?.slice(0, 10)}</div><ul className="mt-1 text-xs space-y-0.5">{Object.entries(rev.conteos).map(([k, v]) => <li key={k}>{k}: <strong>{fmtInt(v)}</strong></li>)}</ul></Panel>
            <Panel><div className="text-sm text-ink2">¿Viste un error?</div><p className="text-sm mt-1">Abre un reporte con la sección, el distrito, el dato y la fuente que lo contradice: <a className="underline" href={rev.como_reportar} target="_blank" rel="noreferrer">reportar en GitHub</a>. Cada corrección queda en el historial del repositorio.</p></Panel>
          </div>
        </div> : <Cargando que="revisión" />}
      </Seccion>
      <Seccion titulo="Cómo se revisa cada dato antes de publicarse">
        <ol className="list-decimal pl-5 text-sm space-y-1 max-w-3xl">
          <li>Solo entra una fuente con URL oficial o científica y licencia conocida; se registra en el catálogo con sus limitaciones.</li>
          <li>El ETL conserva unidades, límites de detección, fechas y coordenadas; no imputa ni rellena con ceros.</li>
          <li>Las pruebas automáticas corren en cada publicación (GitHub Actions); si fallan, el sitio no se despliega.</li>
          <li>Cada cifra en los casos lleva su nivel de evidencia y su enlace; lo que solo dice la prensa queda en B o C.</li>
          <li>Los resultados estadísticos se publican con n, intervalos, controles y las advertencias de falacia ecológica.</li>
        </ol>
      </Seccion>
      <Seccion titulo="Apoya este trabajo">
        <Panel>
          <p className="text-sm max-w-2xl">Proyecto abierto y sin fines de lucro de Carlos Cárdenas. El apoyo cubre laboratorio de agua para los casos piloto, hosting, descargas de datos y el tiempo de mantenerlo vivo. Si prefieres aportar datos, un muestreo o una revisión técnica, escribe a carlos@cardenas.pe.</p>
          <div className="mt-3 flex flex-wrap gap-3">{APOYO.map(a => <div key={a.t} className="rounded border border-line px-3 py-2 text-sm"><span className="text-ink2">{a.t}</span> <strong className="ml-2 tabular-nums">{a.u ? <a className="underline" href={a.u} target="_blank" rel="noreferrer">{a.v}</a> : a.v}</strong></div>)}</div>
        </Panel>
        <div className="mt-3"><Aviso>Ningún aporte condiciona los resultados: los datos, el código y las pruebas son públicos y reproducibles.</Aviso></div>
      </Seccion>
    </>
  )
}
