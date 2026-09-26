import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Titulo, Panel, Evidencia, Aviso, Cargando, Tabla, Seccion, Kpi } from '../components/ui'
import { useData, fmt, pct } from '../lib/data'
import { CAT } from '../lib/colors'

export interface PisaPeru { anio: number; lectura?: number | null; matematica?: number | null; ciencias?: number | null; lectura_bajo_nivel2?: number | null; matematica_bajo_nivel2?: number | null; ciencias_bajo_nivel2?: number | null; [k: string]: unknown }
export interface PisaPais { anio: number; pais: string; iso3: string; matematica: number | null; lectura: number | null; ciencias: number | null; fuente: string }
export interface Pisa { fuente_peru: string; fuente_paises: string; nota: string; peru: PisaPeru[]; paises: PisaPais[] }
const AREAS = [['matematica', 'Matemática', CAT.edu], ['lectura', 'Lectura', CAT.agua], ['ciencias', 'Ciencias', CAT.salud]] as const
const LATAM = new Set(['PER', 'CHL', 'URY', 'MEX', 'CRI', 'BRA', 'COL', 'ARG', 'PAN', 'PRY', 'SLV', 'GTM', 'DOM'])

export default function Pisa() {
  const { data: p } = useData<Pisa>('pisa.json')
  const [area, setArea] = useState<'matematica' | 'lectura' | 'ciencias'>('matematica'); const [anio, setAnio] = useState(2022); const [soloLatam, setSoloLatam] = useState(false)
  const anios = useMemo(() => p ? [...new Set(p.paises.map(x => x.anio))].sort() : [], [p])
  const tabla = useMemo(() => p ? p.paises.filter(x => x.anio === anio && x[area] != null && (!soloLatam || LATAM.has(x.iso3) || x.iso3 === 'OECD')).sort((a, b) => (b[area] ?? 0) - (a[area] ?? 0)) : [], [p, anio, area, soloLatam])
  if (!p) return <Cargando que="PISA" />
  const ult = p.peru[p.peru.length - 1]; const prev = p.peru[p.peru.length - 2]
  const posPeru = tabla.findIndex(x => x.iso3 === 'PER') + 1
  const serie = {
    grid: { left: 44, right: 36, top: 30, bottom: 30 }, legend: { top: 0 }, tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: p.peru.map(r => r.anio) }, yAxis: { type: 'value', min: 300, max: 450, name: 'puntaje', splitLine: { lineStyle: { color: '#e6e9e6' } } },
    series: AREAS.map(([k, l, c]) => ({ name: l, type: 'line', data: p.peru.map(r => r[k] ?? null), itemStyle: { color: c }, lineStyle: { width: 2 }, symbolSize: 8, connectNulls: true, label: { show: true, position: 'right', fontSize: 10, formatter: (v: { value: number; dataIndex: number }) => v.dataIndex === p.peru.length - 1 && v.value ? Math.round(v.value) : '' } })),
  }
  const bajo = {
    grid: { left: 44, right: 16, top: 30, bottom: 30 }, legend: { top: 0 }, tooltip: { trigger: 'axis', valueFormatter: (v: number) => `${fmt(v)} %` },
    xAxis: { type: 'category', data: p.peru.map(r => r.anio) }, yAxis: { type: 'value', min: 0, max: 100, name: '% bajo nivel 2', splitLine: { lineStyle: { color: '#e6e9e6' } } },
    series: AREAS.map(([k, l, c]) => ({ name: l, type: 'line', data: p.peru.map(r => r[`${k}_bajo_nivel2`] ?? null), itemStyle: { color: c }, lineStyle: { width: 2 }, symbolSize: 8, connectNulls: true })),
  }
  const barras = {
    grid: { left: 150, right: 40, top: 8, bottom: 24 }, tooltip: { trigger: 'item' }, xAxis: { type: 'value', min: 300, max: 600, splitLine: { lineStyle: { color: '#e6e9e6' } } },
    yAxis: { type: 'category', data: [...tabla].reverse().map(x => x.pais), axisLabel: { fontSize: 10 } },
    series: [{ type: 'bar', data: [...tabla].reverse().map(x => ({ value: x[area], itemStyle: { color: x.iso3 === 'PER' ? CAT.mina : x.iso3 === 'OECD' ? '#65747c' : LATAM.has(x.iso3) ? CAT.edu : '#c8cdf4', borderRadius: 2 } })), barMaxWidth: 12, label: { show: true, position: 'right', fontSize: 9, formatter: (v: { value: number }) => Math.round(v.value) } }],
  }
  return (
    <>
      <Titulo sub="La prueba PISA de la OCDE mide a los estudiantes de 15 años cada tres años. Es el termómetro internacional del sistema educativo peruano y la razón de este observatorio: entender qué hay detrás de esos resultados, territorio por territorio.">El Perú en PISA</Titulo>
      <Aviso tipo="alerta">PISA es una muestra nacional (2022: 6 968 estudiantes en 337 colegios, 86,3 % de los adolescentes de 15 años). No es representativa por región ni por distrito. Para el análisis distrital el observatorio usa la ENLA, que es censal. {p.nota.includes('representativa') ? '' : p.nota}</Aviso>
      <div className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
        {AREAS.map(([k, l]) => <Kpi key={k} v={fmt(ult[k] as number, 0)} l={`${l} · PISA ${ult.anio}`} nota={prev ? `${(ult[k] as number) - (prev[k] as number) >= 0 ? '+' : ''}${fmt((ult[k] as number) - (prev[k] as number), 0)} vs ${prev.anio}` : undefined} />)}
        {AREAS.map(([k, l]) => <Kpi key={k + 'b'} v={pct(ult[`${k}_bajo_nivel2`] as number)} l={`bajo el nivel 2 en ${l.toLowerCase()}`} nota="no alcanzan competencias básicas" />)}
      </div>
      <Seccion titulo="Serie del Perú 2000–2025" aside={<Evidencia n="A">UMC-MINEDU / OCDE</Evidencia>}>
        <div className="grid gap-4 lg:grid-cols-2"><Panel className="p-2"><div className="text-sm text-ink2 px-2">Puntaje promedio</div><ReactECharts option={serie} style={{ height: 300 }} /></Panel><Panel className="p-2"><div className="text-sm text-ink2 px-2">Estudiantes que no alcanzan el nivel 2</div><ReactECharts option={bajo} style={{ height: 300 }} /></Panel></div>
        <Tabla className="mt-3"><thead><tr><th>Año</th>{AREAS.map(([k, l]) => <th key={k} className="text-right">{l}</th>)}{AREAS.map(([k, l]) => <th key={k + 'b'} className="text-right">% bajo nivel 2 · {l.toLowerCase()}</th>)}<th className="text-right">Estatal / no estatal (mat.)</th></tr></thead><tbody>
          {p.peru.map(r => <tr key={r.anio}><td>{r.anio}</td>{AREAS.map(([k]) => <td key={k} className="text-right tabular-nums">{fmt(r[k] as number, 0)}{r[`${k}_ee`] != null ? <span className="text-ink3 text-xs"> ±{fmt(r[`${k}_ee`] as number, 1)}</span> : ''}</td>)}{AREAS.map(([k]) => <td key={k + 'b'} className="text-right tabular-nums">{pct(r[`${k}_bajo_nivel2`] as number)}</td>)}<td className="text-right tabular-nums">{fmt(r.matematica_estatal as number, 0)} / {fmt(r.matematica_no_estatal as number, 0)}</td></tr>)}
        </tbody></Tabla>
        <p className="mt-2 text-xs text-ink2">Fuente: {p.fuente_peru}. El error estándar (±) acompaña cada promedio; 2000 corresponde a PISA+ (solo lectura comparable).</p>
      </Seccion>
      {p.paises.length > 0 && <Seccion titulo="Comparación internacional" aside={<Evidencia n="A">OCDE</Evidencia>}>
        <div className="flex flex-wrap gap-3 items-center text-sm mb-2">
          {AREAS.map(([k, l]) => <button key={k} onClick={() => setArea(k)} className={`rounded-full border px-3 py-1 ${area === k ? 'border-agua bg-agua/10' : 'border-line text-ink2'}`}>{l}</button>)}
          <select className="rounded border border-line bg-surface px-2 py-1" value={anio} onChange={e => setAnio(+e.target.value)}>{anios.map(a => <option key={a} value={a}>PISA {a}</option>)}</select>
          <label className="flex items-center gap-1"><input type="checkbox" checked={soloLatam} onChange={e => setSoloLatam(e.target.checked)} /> solo América Latina y promedio OCDE</label>
          {posPeru > 0 && <span className="ml-auto">Perú: puesto <strong>{posPeru}</strong> de {tabla.length} {soloLatam ? 'en la región' : 'participantes con dato'}</span>}
        </div>
        <Panel className="p-2"><ReactECharts option={barras} style={{ height: Math.max(320, 14 * tabla.length + 40) }} notMerge /></Panel>
        <p className="mt-2 text-xs text-ink2">Óxido = Perú; índigo = América Latina; gris = promedio OCDE. Fuente por fila en el archivo <a className="underline" href={`${import.meta.env.BASE_URL}data/pisa.json`}>pisa.json</a>.</p>
      </Seccion>}
      <Seccion titulo="Qué aporta el observatorio a esta pregunta">
        <div className="grid gap-3 md:grid-cols-3">
          <Panel><Evidencia n="B" /><p className="mt-2 text-sm">Los factores socioeconómicos explican alrededor del 30 % de la variación distrital en aprendizajes; las variables ambientales añaden menos de 2 puntos. <Link className="underline" to="/conclusiones">Ver el modelo</Link>.</p></Panel>
          <Panel><Evidencia n="A" /><p className="mt-2 text-sm">La ENLA (censal, 4.º de primaria) permite bajar del promedio nacional de PISA al distrito y verlo junto a la exposición ambiental. <Link className="underline" to="/">Ver el mapa</Link>.</p></Panel>
          <Panel><Evidencia n="D" /><p className="mt-2 text-sm">Lo que falta para responder mejor: resultados por colegio, agua de consumo por localidad y biomarcadores. <Link className="underline" to="/brechas">Ver brechas</Link>.</p></Panel>
        </div>
      </Seccion>
    </>
  )
}
