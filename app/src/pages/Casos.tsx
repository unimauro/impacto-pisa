import { useParams, Link } from 'react-router-dom'
import { Titulo, Panel, Evidencia, Aviso, Cargando, Tabla, Seccion, LinkDistrito, type Nivel } from '../components/ui'
import { useData, useDistritos, fmt, fmtInt, pct } from '../lib/data'

interface Hallazgo { nivel: Nivel; texto: string; fuente?: string; url?: string }
interface Caso { id: string; titulo: string; lugar: string; ubigeos: string[]; pregunta: string; resumen: string; hallazgos: Hallazgo[]; mediciones?: { que: string; valor: string; referencia: string; fuente: string; url?: string; anio?: string }[]; ficha?: { campo: string; valor: string }[]; faltantes: string[]; siguientes: string[]; referencias: { titulo: string; url: string; anio?: string }[] }

export default function Casos() {
  const { id } = useParams(); const { data: casos } = useData<Caso[]>('casos.json'); const { data: dist } = useDistritos()
  if (!casos) return <Cargando que="estudios de caso" />
  const c = casos.find(x => x.id === id) ?? casos[0]
  return (
    <>
      <Titulo sub="Territorios prioritarios donde el observatorio junta lo que está medido, lo que se sospecha y lo que falta, para orientar estudios de campo y proyectos concretos.">Estudios de caso</Titulo>
      <nav className="flex flex-wrap gap-2 mb-6" aria-label="Casos">{casos.map(x => <Link key={x.id} to={`/casos/${x.id}`} className={`rounded-full border px-3 py-1 text-sm ${x.id === c.id ? 'border-agua bg-agua/10' : 'border-line text-ink2'}`}>{x.titulo}</Link>)}</nav>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div><h2 className="text-3xl font-medium">{c.titulo}</h2><p className="text-ink2">{c.lugar}</p><p className="mt-3 max-w-3xl">{c.resumen}</p><p className="mt-2 text-sm"><strong>Pregunta de investigación:</strong> {c.pregunta}</p></div>
          <Panel>
            <h3 className="font-medium mb-2">Qué se sabe y con qué certeza</h3>
            <ul className="space-y-2 text-sm">{c.hallazgos.map((h, i) => <li key={i} className="flex gap-2"><Evidencia n={h.nivel} /><span>{h.texto}{h.fuente && <span className="text-ink2"> — {h.url ? <a className="underline" href={h.url} target="_blank" rel="noreferrer">{h.fuente}</a> : h.fuente}</span>}</span></li>)}</ul>
          </Panel>
          {c.mediciones && c.mediciones.length > 0 && <Panel>
            <h3 className="font-medium mb-2">Mediciones documentadas</h3>
            <Tabla><thead><tr><th>Qué</th><th>Valor</th><th>Referencia</th><th>Fuente</th></tr></thead><tbody>{c.mediciones.map((m, i) => <tr key={i}><td>{m.que}</td><td className="tabular-nums">{m.valor}</td><td className="text-ink2">{m.referencia}</td><td className="text-xs">{m.url ? <a className="underline" href={m.url} target="_blank" rel="noreferrer">{m.fuente}</a> : m.fuente}{m.anio ? ` (${m.anio})` : ''}</td></tr>)}</tbody></Tabla>
          </Panel>}
          {c.ficha && <Panel>
            <h3 className="font-medium mb-2">Ficha de proyecto</h3>
            <Tabla><tbody>{c.ficha.map((f, i) => <tr key={i}><td className="text-ink2 w-56">{f.campo}</td><td>{f.valor}</td></tr>)}</tbody></Tabla>
          </Panel>}
          <Panel>
            <h3 className="font-medium mb-2">Datos del observatorio para estos distritos</h3>
            {dist ? <Tabla><thead><tr><th>Distrito</th><th className="text-right">Pob.</th><th className="text-right">Pobreza</th><th className="text-right">REINFO</th><th className="text-right">PAM</th><th className="text-right">Sed. n</th><th className="text-right">As med. ppm</th><th className="text-right">Hg med. ppb</th><th className="text-right">ENLA lect. sat.</th><th className="text-right">Mort. renal</th><th className="text-right">Cáncer piel</th></tr></thead><tbody>
              {c.ubigeos.map(u => { const d = dist.find(x => x.ubigeo === u); if (!d) return <tr key={u}><td colSpan={11}>{u}: sin polígono</td></tr>; return <tr key={u}><td><LinkDistrito ubigeo={u}>{d.distrito}</LinkDistrito> <span className="text-ink3 text-xs">{d.provincia}</span></td><td className="text-right tabular-nums">{fmtInt(d.pob)}</td><td className="text-right tabular-nums">{pct(d.pobreza)}</td><td className="text-right tabular-nums">{d.reinfo_total}</td><td className="text-right tabular-nums">{d.pam_n}</td><td className="text-right tabular-nums">{d.sed_n ?? '—'}</td><td className="text-right tabular-nums">{fmt(d.sed_as_med, 1)}</td><td className="text-right tabular-nums">{fmt(d.sed_hg_med, 0)}</td><td className="text-right tabular-nums">{pct(d.enla_lec_sat)}</td><td className="text-right tabular-nums">{d.tasa_inestable ? 'n<5k' : fmt(d.tasa_renal as number)}</td><td className="text-right tabular-nums">{d.tasa_inestable ? 'n<5k' : fmt(d.tasa_cancer_piel as number)}</td></tr> })}
            </tbody></Tabla> : <Cargando />}
            <p className="mt-2 text-xs text-ink2">Tasas por 100 mil hab-año (SINADEF 2019–2025, crudas). «—» = sin medición.</p>
          </Panel>
        </div>
        <aside className="space-y-4">
          <Panel><h3 className="font-medium mb-2">Lo que falta medir</h3><ul className="text-sm space-y-1.5">{c.faltantes.map((f, i) => <li key={i} className="flex gap-2"><Evidencia n="D" /><span>{f}</span></li>)}</ul></Panel>
          <Panel><h3 className="font-medium mb-2">Siguientes pasos propuestos</h3><ol className="list-decimal pl-5 text-sm space-y-1">{c.siguientes.map((s, i) => <li key={i}>{s}</li>)}</ol></Panel>
          <Panel><h3 className="font-medium mb-2">Referencias</h3><ul className="text-xs space-y-1">{c.referencias.map((r, i) => <li key={i}><a className="underline" href={r.url} target="_blank" rel="noreferrer">{r.titulo}</a>{r.anio ? ` (${r.anio})` : ''}</li>)}</ul></Panel>
        </aside>
      </div>
      <Seccion titulo="Regla de los casos"><Aviso>Ningún caso afirma que una población esté intoxicada sin mediciones representativas. Cada afirmación lleva su nivel de evidencia y su fuente; las hipótesis se marcan como tales.</Aviso></Seccion>
    </>
  )
}
