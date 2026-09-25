import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Mapa from '../components/Mapa'
import { Titulo, Panel, Evidencia, Aviso, Cargando, Tabla, Error as Err, Seccion, LinkDistrito } from '../components/ui'
import { useAguas, useSedimentos, useDistritos, fmt, fmtInt } from '../lib/data'
import { RAMPAS, CAT } from '../lib/colors'

const LMP = { as: 0.01, hg: 0.001, pb: 0.01, cd: 0.003 } // DS 031-2010-SA agua de consumo humano (mg/L)
const ECA_A1 = { as: 0.01, hg: 0.001, pb: 0.01, cd: 0.003 } // ECA Agua cat. 1-A1 (DS 004-2017-MINAM)
const PEL = { as: 17, hg: 486, pb: 91.3, cd: 3.5 }
export default function Agua() {
  const { data: aguas, error } = useAguas(); const { data: sed } = useSedimentos(); const { data: dist } = useDistritos(); const nav = useNavigate()
  const [el, setEl] = useState<'as' | 'hg' | 'pb' | 'cd'>('as'); const [verSed, setVerSed] = useState(true)
  const byU = useMemo(() => new Map(dist?.map(d => [d.ubigeo, d])), [dist])
  const idxEl = { as: 2, hg: 3, pb: 4, cd: 5 }[el]
  const puntos = useMemo(() => {
    const out: { lon: number; lat: number; color: string; r?: number; tip?: string }[] = []
    if (verSed && sed) for (const p of sed.puntos) { const v = p[idxEl] as number | null; if (v == null) continue; const sobre = v > PEL[el]; out.push({ lon: p[0], lat: p[1], color: sobre ? CAT.mina : RAMPAS.socio[2], r: sobre ? 3 : 1.5, tip: `${p[8]} · ${el.toUpperCase()} ${fmt(v, 2)} ${el === 'hg' ? 'ppb' : 'ppm'} · ${p[6]}` }) }
    if (aguas) for (const a of aguas) { const v = a[el]; const sobre = v != null && v > LMP[el]; out.push({ lon: a.lon, lat: a.lat, color: sobre ? CAT.mina : CAT.agua, r: 6, tip: `<b>Agua superficial ${a.codigo}</b><br>${el.toUpperCase()}: ${v == null ? 'no analizado' : (a[`${el}_ld` as 'as_ld'] ? '< LD ' : '') + fmt(v, 4) + ' mg/L'}<br>LMP consumo ${LMP[el]} mg/L` }) }
    return out
  }, [aguas, sed, el, verSed, idxEl])
  if (error) return <Err msg={error} />
  const sobreLMP = aguas?.filter(a => a[el] != null && a[el]! > LMP[el]) ?? []
  return (
    <>
      <Titulo sub="Puntos de muestreo con metales en agua superficial (INGEMMET) comparados con el límite máximo permisible para consumo humano y el ECA de agua. Sobre ellos, la geoquímica de sedimentos como contexto. Perú no publica como dato abierto la vigilancia del agua que la gente bebe.">Agua segura</Titulo>
      <Aviso tipo="alerta">INGEMMET solo tiene 54 análisis de aguas superficiales georreferenciados en su servicio público. Esa es la brecha principal del país: ANA y DIGESA miden mucho más, pero publican en PDF. El mapa muestra dónde hay evidencia, no dónde el agua es segura.</Aviso>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span>Elemento:</span>{(['as', 'hg', 'pb', 'cd'] as const).map(e => <button key={e} onClick={() => setEl(e)} className={`rounded-full border px-3 py-1 ${el === e ? 'border-agua bg-agua/10' : 'border-line text-ink2'}`}>{{ as: 'Arsénico', hg: 'Mercurio', pb: 'Plomo', cd: 'Cadmio' }[e]}</button>)}
        <label className="ml-auto flex items-center gap-1"><input type="checkbox" checked={verSed} onChange={e => setVerSed(e.target.checked)} /> sedimentos de quebrada ({sed ? fmtInt(sed.n) : '…'} muestras)</label>
      </div>
      <div className="mt-3">{dist ? <Mapa height="62vh" valor={() => null} color={() => null} puntos={puntos} onClick={u => nav(`/distrito/${u}`)} tooltip={(_, nm) => nm} /> : <Cargando que="mapa" />}</div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink2"><span><i className="inline-block h-3 w-3 rounded-full align-middle" style={{ background: CAT.agua }} /> agua superficial ≤ LMP</span><span><i className="inline-block h-3 w-3 rounded-full align-middle" style={{ background: CAT.mina }} /> agua &gt; LMP consumo / sedimento &gt; PEL</span><span><i className="inline-block h-2 w-2 rounded-full align-middle" style={{ background: RAMPAS.socio[2] }} /> sedimento ≤ PEL</span></div>
      <Seccion titulo={`Análisis de aguas superficiales con ${{ as: 'arsénico', hg: 'mercurio', pb: 'plomo', cd: 'cadmio' }[el]} sobre el límite de consumo`} aside={<Evidencia n="A">{sobreLMP.length} de {aguas?.length ?? 0} puntos</Evidencia>}>
        <Tabla><thead><tr><th>Código</th><th>Distrito</th><th className="text-right">As mg/L</th><th className="text-right">Hg mg/L</th><th className="text-right">Pb mg/L</th><th className="text-right">Cd mg/L</th><th>Informe</th></tr></thead><tbody>
          {(aguas ?? []).filter(a => a[el] != null).sort((a, b) => (b[el] ?? 0) - (a[el] ?? 0)).slice(0, 30).map(a => { const d = a.ubigeo ? byU.get(a.ubigeo) : null; return <tr key={a.codigo} className={a[el]! > LMP[el] ? 'text-mina' : ''}><td>{a.codigo}</td><td>{d ? <LinkDistrito ubigeo={d.ubigeo}>{d.distrito}, {d.departamento}</LinkDistrito> : '—'}</td>{(['as', 'hg', 'pb', 'cd'] as const).map(e => <td key={e} className="text-right tabular-nums">{a[e] == null ? '—' : `${a[`${e}_ld` as 'as_ld'] ? '<' : ''}${fmt(a[e], 4)}`}</td>)}<td className="text-ink2 text-xs">{a.informe}</td></tr> })}
        </tbody></Tabla>
        <p className="mt-2 text-xs text-ink2">Valores «&lt;» están bajo el límite de detección del laboratorio. Referencias: LMP agua de consumo humano (DS 031-2010-SA): As 0,010 · Hg 0,001 · Pb 0,010 · Cd 0,003 mg/L; ECA Agua cat. 1-A1 (DS 004-2017-MINAM) coincide en estos cuatro metales (As {ECA_A1.as}). Estas muestras son de cuerpos de agua superficial, no necesariamente de fuentes de abastecimiento.</p>
      </Seccion>
      <Seccion titulo="Tecnologías de tratamiento aplicables (referencia)" aside={<Evidencia n="C" />}>
        <Panel><Tabla><thead><tr><th>Contaminante</th><th>Tecnología</th><th>Escala típica</th><th>Consideraciones</th></tr></thead><tbody>
          <tr><td>Arsénico</td><td>Coagulación-filtración con sales de hierro; adsorción en óxidos de hierro (GFH); ósmosis inversa; filtros de arena con hierro cerovalente (SONO)</td><td>Familiar a comunal (80–500 familias)</td><td>Requiere oxidar As(III) a As(V); disposición del lodo arsenical; monitoreo trimestral.</td></tr>
          <tr><td>Mercurio</td><td>Carbón activado; coagulación; ósmosis inversa. Prioridad: eliminar la fuente (amalgamación) y controlar el pescado.</td><td>Comunal</td><td>El riesgo principal es metilmercurio en dieta, no en agua.</td></tr>
          <tr><td>Plomo / cadmio</td><td>Ablandamiento con cal, intercambio iónico, ósmosis inversa</td><td>Comunal</td><td>Corrección de pH evita lixiviación en tuberías.</td></tr>
          <tr><td>Microbiológico</td><td>Cloración, filtración lenta de arena, UV</td><td>Familiar a comunal</td><td>Base de todo sistema; cloro residual 0,5 mg/L.</td></tr>
        </tbody></Tabla><p className="mt-2 text-xs text-ink2">Referencia general (OMS, Guías para la calidad del agua de consumo humano, 4.ª ed.). El diseño concreto exige caracterización del agua local: ver el caso de Puerto Almendra.</p></Panel>
      </Seccion>
    </>
  )
}
