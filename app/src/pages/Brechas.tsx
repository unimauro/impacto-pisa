import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Mapa from '../components/Mapa'
import { Titulo, Panel, Evidencia, Aviso, Cargando, Tabla, Error as Err, Seccion } from '../components/ui'
import { useDistritos, useResumen, fmtInt, pct } from '../lib/data'
import { RAMPAS } from '../lib/colors'

const CAPAS: [string, string, string][] = [
  ['sed', 'Geoquímica de sedimentos (INGEMMET)', 'Muestras georreferenciadas de quebradas, 2000–2018'],
  ['oefa_agua', 'Metales en agua superficial (OEFA)', 'Supervisión y evaluación ambiental 2014–2026; muestreo dirigido'],
  ['agua', 'Análisis de metales en agua superficial (INGEMMET)', 'Solo 54 puntos en el país'],
  ['ece16', 'ECE 2016 distrital (serie 4.º primaria)', 'Permite ver cambio 2016→2024'],
  ['desercion', 'Deserción y atraso escolar (ESCALE-SIAGIE)', '~1 890 distritos'],
  ['edu', 'ENLA 2024 distrital (UMC)', 'Publicado solo con ≥ 10 estudiantes y cobertura suficiente'],
  ['salud', 'Mortalidad SINADEF por domicilio', 'Registro administrativo; subregistro variable'],
  ['pam', 'Pasivos ambientales mineros (MINEM)', 'Inventario; 0 = sin pasivos registrados'],
  ['reinfo', 'REINFO (MINEM)', 'Registro; 0 = sin inscritos'],
  ['gasto', 'Gasto público SIAF-MEF', 'Por ubicación de unidad ejecutora'],
]
export default function Brechas() {
  const { data: dist, error } = useDistritos(); const { data: res } = useResumen(); const nav = useNavigate()
  const [modo, setModo] = useState<'score' | 'sed' | 'oefa_agua' | 'edu' | 'salud'>('score')
  const score = useMemo(() => new Map(dist?.map(d => [d.ubigeo, ['sed', 'edu', 'salud', 'socio', 'oefa_agua'].filter(k => d.cob[k]).length])), [dist])
  const byU = useMemo(() => new Map(dist?.map(d => [d.ubigeo, d])), [dist])
  const porDep = useMemo(() => { if (!dist) return []; const m = new Map<string, { n: number; sed: number; edu: number; salud: number; agua: number; sedN: number }>(); for (const d of dist) { const r = m.get(d.departamento) ?? { n: 0, sed: 0, edu: 0, salud: 0, agua: 0, sedN: 0 }; r.n++; if (d.cob.sed) r.sed++; if (d.cob.edu) r.edu++; if (d.cob.salud) r.salud++; if (d.cob.oefa_agua) r.agua++; r.sedN += d.sed_n ?? 0; m.set(d.departamento, r) } return [...m.entries()].sort((a, b) => a[1].sed / a[1].n - b[1].sed / b[1].n) }, [dist])
  if (error) return <Err msg={error} />
  const valor = (u: string) => { const d = byU.get(u); if (!d) return null; if (modo === 'score') return score.get(u) ?? 0; return d.cob[modo] ? 1 : 0 }
  const color = (v: number | null) => v == null ? null : modo === 'score' ? RAMPAS.agua[Math.min(5, v + 1)] : v ? RAMPAS.agua[4] : '#f1e5dc'
  return (
    <>
      <Titulo sub="Este mapa no muestra contaminación: muestra dónde hay mediciones y dónde no. Un distrito en blanco no está limpio; está sin medir. Es el insumo para las solicitudes de acceso a la información pública.">Brechas de información</Titulo>
      <div className="flex flex-wrap gap-2 mb-3 text-sm">
        {([['score', 'Capas disponibles (0–5)'], ['sed', 'Sedimentos INGEMMET'], ['oefa_agua', 'Agua con metales (OEFA)'], ['edu', 'ENLA 2024'], ['salud', 'SINADEF']] as const).map(([k, l]) => <button key={k} onClick={() => setModo(k)} className={`rounded-full border px-3 py-1 ${modo === k ? 'border-agua bg-agua/10 text-ink' : 'border-line text-ink2'}`}>{l}</button>)}
      </div>
      {dist ? <Mapa height="62vh" valor={valor} color={color} onClick={u => nav(`/distrito/${u}`)} tooltip={(u, nm) => { const d = byU.get(u); return `<b>${nm}</b><br>${CAPAS.filter(c => c[0] !== 'gasto').map(c => `${d?.cob[c[0]] ? '●' : '○'} ${c[1].split(' (')[0]}`).join('<br>')}` }} /> : <Cargando que="mapa" />}
      <div className="mt-2 text-xs text-ink2">{modo === 'score' ? 'Verdigris más oscuro = más capas con datos (sedimentos, agua OEFA, educación, salud, socioeconómico).' : 'Verdigris = con dato; beige = sin dato.'}</div>
      {res && <Seccion titulo="Cobertura nacional por capa">
        <Tabla><thead><tr><th>Capa</th><th className="text-right">Distritos con dato</th><th className="text-right">%</th><th>Nota</th><th>Estado</th></tr></thead><tbody>
          {CAPAS.map(([k, l, nota]) => { const n = res.cobertura[k] ?? 0; return <tr key={k}><td>{l}</td><td className="text-right tabular-nums">{fmtInt(n)} / {fmtInt(res.n_distritos)}</td><td className="text-right tabular-nums">{pct(n / res.n_distritos * 100)}</td><td className="text-ink2">{nota}</td><td><Evidencia n={n / res.n_distritos > 0.8 ? 'A' : n / res.n_distritos > 0.3 ? 'B' : 'D'}>{n / res.n_distritos > 0.8 ? 'buena' : n / res.n_distritos > 0.3 ? 'parcial' : 'escasa'}</Evidencia></td></tr> })}
        </tbody></Tabla>
      </Seccion>}
      <Seccion titulo="Departamentos con menos muestreo geoquímico">
        <Tabla><thead><tr><th>Departamento</th><th className="text-right">Distritos</th><th className="text-right">con sedimentos</th><th className="text-right">muestras</th><th className="text-right">con ENLA</th><th className="text-right">con SINADEF</th><th className="text-right">con agua</th></tr></thead><tbody>
          {porDep.map(([dep, r]) => <tr key={dep}><td>{dep}</td><td className="text-right tabular-nums">{r.n}</td><td className="text-right tabular-nums">{pct(r.sed / r.n * 100)}</td><td className="text-right tabular-nums">{fmtInt(r.sedN)}</td><td className="text-right tabular-nums">{pct(r.edu / r.n * 100)}</td><td className="text-right tabular-nums">{pct(r.salud / r.n * 100)}</td><td className="text-right tabular-nums">{r.agua}</td></tr>)}
        </tbody></Tabla>
      </Seccion>
      <Seccion titulo="Datos que el Estado tiene y no publica en formato abierto">
        <Panel><ul className="list-disc pl-5 text-sm space-y-1.5">
          <li><strong>ANA</strong>: resultados del monitoreo de calidad de agua superficial (parámetros, valores, fecha, coordenadas). Se publica en informes PDF por cuenca, no como microdato.</li>
          <li><strong>DIGESA / DIRESA</strong>: vigilancia de la calidad del agua de consumo humano (arsénico, metales, cloro residual) por sistema de abastecimiento y localidad.</li>
          <li><strong>CDC-MINSA</strong>: notificación de exposición e intoxicación por metales pesados (Directiva Sanitaria N.º 069) por distrito, año y metal.</li>
          <li><strong>INS-CENSOPAS</strong>: resultados de dosajes de plomo, mercurio y arsénico en sangre/orina de campañas poblacionales, agregados por localidad.</li>
          <li><strong>MINSA HIS</strong>: consultas externas por diagnóstico CIE-10 y distrito (enfermedad renal, hepática, dermatológica, neurodesarrollo).</li>
          <li><strong>OEFA</strong>: emergencias ambientales y derrames por evento con fecha, volumen y responsable (hoy sin capa pública).</li>
          <li><strong>MINEDU-UMC</strong>: ENLA 2024 de 2.º de secundaria a nivel distrital; ECE 2016–2019 distrital para series comparables.</li>
        </ul>
        <p className="mt-3 text-sm text-ink2">Las solicitudes de acceso a la información pública (Ley 27806) listas para presentar están en <a className="underline" href="https://github.com/unimauro/observatorio-peru/blob/main/docs/solicitudes-transparencia.md">docs/solicitudes-transparencia.md</a>.</p></Panel>
      </Seccion>
      <div className="mt-6"><Aviso>Un cero en un inventario (pasivos, REINFO) significa que no hay registros, no que no exista actividad. Un vacío en sedimentos o agua significa que nadie ha medido.</Aviso></div>
    </>
  )
}
