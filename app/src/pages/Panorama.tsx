import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Mapa, { Leyenda } from '../components/Mapa'
import { Titulo, Panel, Kpi, Evidencia, Aviso, Cargando, Error as Err } from '../components/ui'
import { useDistritos, useResumen, useData, VARS, varById, fmt, fmtInt, pct, quantiles, DOMINIO_LABEL, type Dominio } from '../lib/data'
import type { Pisa } from './Pisa'
interface Fact { resultados: { y: string; label: string; modelo_todos: { n: number; r2: number }; r2_socio: number; ganancia_ambiente: number }[] }
import { RAMPAS, colorScale } from '../lib/colors'

export default function Panorama() {
  const { data: dist, error } = useDistritos(); const { data: res } = useResumen(); const nav = useNavigate(); const { data: pisa } = useData<Pisa>('pisa.json'); const { data: fac } = useData<Fact>('factores.json')
  const ult = pisa?.peru[pisa.peru.length - 1]; const prev = pisa?.peru[pisa.peru.length - 2]; const fl = fac?.resultados.find(r => r.y === 'enla_lec_sat')
  const [varId, setVarId] = useState('sed_as_med'); const [dep, setDep] = useState('')
  const v = varById(varId)
  const deps = useMemo(() => dist ? [...new Set(dist.map(d => d.departamento))].sort() : [], [dist])
  const idx = useMemo(() => { const m = new Map<string, number | null>(); dist?.forEach(d => { if (!dep || d.departamento === dep) m.set(d.ubigeo, v.get(d)) }); return m }, [dist, v, dep])
  const vals = useMemo(() => [...idx.values()].filter((x): x is number => x != null), [idx])
  const breaks = useMemo(() => vals.length ? quantiles(vals, [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6]) : [], [vals])
  const color = useMemo(() => colorScale(RAMPAS[v.dominio], breaks), [v.dominio, breaks])
  const byU = useMemo(() => new Map(dist?.map(d => [d.ubigeo, d])), [dist])
  const fit = useMemo(() => { if (!dep || !dist) return undefined; return undefined }, [dep, dist])
  if (error) return <Err msg={error} />
  return (
    <>
      <Titulo sub={<>El Perú vuelve a retroceder en PISA. Este observatorio baja del promedio nacional al distrito y cruza aprendizajes con pobreza, agua, minería y contaminación usando solo datos oficiales. Separa lo <strong>medido</strong>, lo <strong>asociado estadísticamente</strong>, las <strong>hipótesis</strong> y los <strong>vacíos</strong>.</>}>
        Impacto que PISA: ¿qué hay detrás de los resultados del Perú?
      </Titulo>
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr] mb-6">
        <Panel className="border-agua/40">
          <div className="flex items-center justify-between"><span className="text-sm text-ink2">Conclusión principal, con los datos de {fmtInt(fl?.modelo_todos.n)} distritos</span><Evidencia n="B" /></div>
          <p className="mt-2 text-lg leading-snug font-display">Los bajos resultados son multifactoriales: pobreza, ruralidad, altitud y conectividad explican cerca del {fl ? pct(fl.r2_socio * 100) : '…'} de las diferencias entre distritos en lectura; toda la exposición ambiental medida añade menos de {fl ? fmt(fl.ganancia_ambiente * 100, 1) : '…'} puntos.</p>
          <p className="mt-2 text-sm text-ink2">Eso no absuelve a la contaminación: dice que, con datos distritales, su huella en el aprendizaje es pequeña frente a la desigualdad, y que la exposición real (agua de consumo, biomarcadores) no está medida. <Link className="underline" to="/conclusiones">Ver el modelo y las demás conclusiones</Link>.</p>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between"><span className="text-sm text-ink2">El Perú en PISA {ult?.anio}</span><Evidencia n="A">OCDE / UMC</Evidencia></div>
          {ult && prev ? <div className="mt-2 grid grid-cols-3 gap-2">
            {([['matematica', 'Matemática'], ['lectura', 'Lectura'], ['ciencias', 'Ciencias']] as const).map(([k, l]) => { const d = (ult[k] as number) - (prev[k] as number); return <div key={k}><div className="font-display text-3xl leading-none">{fmt(ult[k] as number, 0)}</div><div className="text-xs text-ink2">{l}</div><div className={`text-xs ${d < 0 ? 'text-mina' : 'text-agua'}`}>{d >= 0 ? '+' : ''}{fmt(d, 0)} vs {prev.anio}</div><div className="text-xs text-ink3">{pct(ult[`${k}_bajo_nivel2`] as number)} bajo nivel 2</div></div> })}
          </div> : <Cargando que="PISA" />}
          <p className="mt-2 text-sm"><Link className="underline" to="/pisa">Serie 2000–2025 y comparación con el mundo</Link></p>
        </Panel>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">{(['A', 'B', 'C', 'D'] as const).map(n => <Evidencia key={n} n={n} />)}</div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <div className="flex flex-wrap gap-2 mb-3 items-end">
            <label className="text-sm flex-1 min-w-[16rem]">Variable en el mapa
              <select className="mt-1 block w-full rounded border border-line bg-surface px-2 py-1.5" value={varId} onChange={e => setVarId(e.target.value)}>
                {(Object.keys(DOMINIO_LABEL) as Dominio[]).map(dom => <optgroup key={dom} label={DOMINIO_LABEL[dom]}>{VARS.filter(x => x.dominio === dom).map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</optgroup>)}
              </select></label>
            <label className="text-sm">Departamento
              <select className="mt-1 block rounded border border-line bg-surface px-2 py-1.5" value={dep} onChange={e => setDep(e.target.value)}><option value="">Todo el Perú</option>{deps.map(d => <option key={d}>{d}</option>)}</select></label>
          </div>
          {dist ? <Mapa valor={u => idx.get(u) ?? null} color={color} fit={fit} onClick={u => nav(`/distrito/${u}`)}
            tooltip={(u, nombre) => { const d = byU.get(u); const x = idx.get(u); return `<b>${nombre}</b><br>${v.corto}: ${x == null ? 'sin dato' : fmt(x, v.log ? 2 : 1) + ' ' + v.unidad}${d?.enla_cob_est != null && v.dominio === 'educacion' ? `<br>cobertura ENLA ${fmt(d.enla_cob_est)} %` : ''}<br><span style="color:#888">clic para ver el distrito</span>` }} /> : <Cargando que="distritos" />}
          <div className="mt-3"><Leyenda steps={RAMPAS[v.dominio]} breaks={breaks} unidad={v.unidad} fmt={x => fmt(x, v.log ? 2 : 1)} titulo={v.label} /></div>
        </div>
        <aside className="space-y-3">
          <Panel>
            <div className="text-sm text-ink2">Variable seleccionada</div>
            <div className="font-medium">{v.label}</div>
            <div className="mt-1 text-sm text-ink2">Fuente: {v.fuente}</div>
            <div className="mt-1 text-sm">{v.nota}</div>
            <div className="mt-2 text-sm">Distritos con dato: <strong>{fmtInt(vals.length)}</strong> de {fmtInt(idx.size)} <Evidencia n={vals.length ? 'A' : 'D'} /></div>
          </Panel>
          {res && <Panel>
            <div className="text-sm text-ink2 mb-2">Qué hay en el observatorio</div>
            <div className="grid grid-cols-2 gap-3">
              <Kpi v={fmtInt(res.sedimentos.n)} l="muestras de sedimento" nota="INGEMMET 2000–2018" />
              <Kpi v={fmtInt(res.pam.n)} l="pasivos mineros" nota="MINEM" />
              <Kpi v={fmtInt(res.reinfo.n)} l="registros REINFO" nota={`${fmtInt(res.reinfo.vigente)} vigentes`} />
              <Kpi v={fmtInt(res.enla.n_distritos)} l="distritos con ENLA 2024" nota="UMC-MINEDU" />
              <Kpi v={fmtInt(res.sinadef.def_total)} l="defunciones 2019–2025" nota="SINADEF" />
              <Kpi v={fmtInt(res.oefa_agua?.muestras)} l="análisis de metales en agua" nota={`OEFA, ${fmtInt(res.oefa_agua?.distritos)} distritos`} />
              <Kpi v={fmtInt(res.emergencias?.n)} l="emergencias ambientales" nota="OEFA 2011–2026" />
              <Kpi v={fmtInt(res.mineria_ilegal_ha)} l="ha de minería ilegal identificada" nota="OEFA PIFA" />
            </div>
          </Panel>}
          <Panel>
            <div className="text-sm text-ink2 mb-1">Siguientes pasos</div>
            <ul className="text-sm space-y-1">
              <li><Link className="underline" to="/relaciones">Ver qué relaciones tienen respaldo estadístico</Link></li>
              <li><Link className="underline" to="/brechas">Ver dónde faltan mediciones</Link></li>
              <li><Link className="underline" to="/casos">Estudios de caso: Puerto Almendra, Nazca, Puno y Madre de Dios</Link></li>
            </ul>
          </Panel>
        </aside>
      </div>
      <div className="mt-6"><Aviso>Las capas geoquímicas de INGEMMET describen sedimentos de quebrada, no el agua que bebe la población; REINFO registra mineros en formalización, no minería ilegal. Las tasas de mortalidad son crudas y de un registro con subregistro. Ver <Link className="underline" to="/metodologia">metodología</Link>.</Aviso></div>
    </>
  )
}
