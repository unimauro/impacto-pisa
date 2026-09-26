import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Mapa from '../components/Mapa'
import { Titulo, Panel, Evidencia, Aviso, Cargando, Tabla, Error as Err, Seccion, LinkDistrito } from '../components/ui'
import { useOefaAgua, useSedimentos, useDistritos, fmt, fmtInt, pct } from '../lib/data'
import { RAMPAS, CAT } from '../lib/colors'

const NOMBRE = { as: 'Arsénico', hg: 'Mercurio', pb: 'Plomo', cd: 'Cadmio' } as const
const PEL = { as: 17, hg: 486, pb: 91.3, cd: 3.5 }
type El = keyof typeof NOMBRE
export default function Agua() {
  const { data: oefa, error } = useOefaAgua(); const { data: sed } = useSedimentos(); const { data: dist } = useDistritos(); const nav = useNavigate()
  const [el, setEl] = useState<El>('as'); const [verSed, setVerSed] = useState(false); const [soloExced, setSoloExced] = useState(false)
  const eca = oefa?.eca[el] ?? [0, 0]
  const puntos = useMemo(() => {
    const out: { lon: number; lat: number; color: string; r?: number; tip?: string }[] = []
    const idx = { as: 2, hg: 3, pb: 4, cd: 5 }[el]
    if (verSed && sed) for (const p of sed.puntos) { const v = p[idx] as number | null; if (v == null) continue; const sobre = v > PEL[el]; if (soloExced && !sobre) continue; out.push({ lon: p[0], lat: p[1], color: sobre ? '#e8a97f' : RAMPAS.socio[1], r: sobre ? 2.5 : 1.2, tip: `Sedimento ${p[8]} · ${el.toUpperCase()} ${fmt(v, 2)} ${el === 'hg' ? 'ppb' : 'ppm'} · ${p[6]}` }) }
    if (oefa) for (const p of oefa.puntos) { if (p[2] !== el) continue; const sobreA1 = p[6] > 0, sobreC3 = p[7] > 0; if (soloExced && !sobreA1) continue; out.push({ lon: p[0], lat: p[1], color: sobreC3 ? CAT.mina : sobreA1 ? '#d98a5c' : CAT.agua, r: sobreC3 ? 5 : sobreA1 ? 4 : 2.5, tip: `<b>OEFA · ${NOMBRE[el]}</b><br>máx. ${fmt(p[3], 4)} mg/L · ${p[5]} análisis (último ${p[4]})<br>${p[6]} sobre ECA A1 (${eca[0]}) · ${p[7]} sobre cat. 3 (${eca[1]})<br>${p[9]}` }) }
    return out
  }, [oefa, sed, el, verSed, soloExced, eca])
  const ranking = useMemo(() => dist?.filter(d => (d[`oefa_${el}_n`] as number) >= 5).map(d => ({ d, n: d[`oefa_${el}_n`] as number, a1: d[`oefa_${el}_pct_a1`] as number, c3: d[`oefa_${el}_pct_cat3`] as number, max: d[`oefa_${el}_max`] as number })).sort((a, b) => b.c3 - a.c3 || b.a1 - a.a1).slice(0, 25) ?? [], [dist, el])
  if (error) return <Err msg={error} />
  const nEl = oefa ? oefa.puntos.filter(p => p[2] === el) : []
  const pctA1 = nEl.length ? nEl.filter(p => p[6] > 0).length / nEl.length * 100 : 0
  return (
    <>
      <Titulo sub="Mediciones reales de metales en ríos, quebradas y lagunas: 75 mil análisis de OEFA (2014–2026) comparados con el Estándar de Calidad Ambiental para agua. El muestreo es dirigido a zonas con actividad fiscalizada, así que muestra dónde hay evidencia de exceso, no un promedio del país.">Agua segura</Titulo>
      <Aviso tipo="alerta">Nada de esto es agua de grifo. El Perú no publica como dato abierto la vigilancia del agua de consumo humano (DIGESA/DIRESA), ni los valores del monitoreo de ANA. Un punto verdigris cumple el ECA en todos sus análisis; un punto óxido lo superó al menos una vez.</Aviso>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span>Metal:</span>{(Object.keys(NOMBRE) as El[]).map(e => <button key={e} onClick={() => setEl(e)} className={`rounded-full border px-3 py-1 ${el === e ? 'border-agua bg-agua/10' : 'border-line text-ink2'}`}>{NOMBRE[e]}</button>)}
        <label className="flex items-center gap-1"><input type="checkbox" checked={soloExced} onChange={e => setSoloExced(e.target.checked)} /> solo puntos que superan el ECA</label>
        <label className="ml-auto flex items-center gap-1"><input type="checkbox" checked={verSed} onChange={e => setVerSed(e.target.checked)} /> sedimentos INGEMMET (contexto)</label>
      </div>
      <div className="mt-3">{dist && oefa ? <Mapa height="62vh" valor={() => null} color={() => null} puntos={puntos} onClick={u => nav(`/distrito/${u}`)} tooltip={(_, nm) => nm} /> : <Cargando que="mapa y 52 mil puntos" />}</div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink2"><span><i className="inline-block h-3 w-3 rounded-full align-middle" style={{ background: CAT.agua }} /> cumple ECA A1 en todos los análisis</span><span><i className="inline-block h-3 w-3 rounded-full align-middle" style={{ background: '#d98a5c' }} /> supera ECA A1 (potabilizable con desinfección)</span><span><i className="inline-block h-3 w-3 rounded-full align-middle" style={{ background: CAT.mina }} /> supera ECA cat. 3 (riego/animales)</span>{verSed && <span><i className="inline-block h-2 w-2 rounded-full align-middle" style={{ background: '#e8a97f' }} /> sedimento &gt; PEL</span>}</div>
      {oefa && <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm"><span><strong>{fmtInt(nEl.length)}</strong> puntos con {NOMBRE[el].toLowerCase()}</span><span><strong>{pct(pctA1)}</strong> de los puntos superó el ECA A1 alguna vez</span><span>ECA A1 <strong>{eca[0]} mg/L</strong> · cat. 3 <strong>{eca[1]} mg/L</strong></span></div>}
      <Seccion titulo={`Distritos con más análisis de ${NOMBRE[el].toLowerCase()} sobre el ECA (≥ 5 análisis)`} aside={<Evidencia n="A">OEFA 2014–2026</Evidencia>}>
        <Tabla><thead><tr><th>Distrito</th><th className="text-right">análisis</th><th className="text-right">% &gt; ECA A1</th><th className="text-right">% &gt; cat. 3</th><th className="text-right">máx. mg/L</th><th className="text-right">REINFO</th><th className="text-right">PAM</th><th className="text-right">Emerg.</th></tr></thead><tbody>
          {ranking.map(r => <tr key={r.d.ubigeo}><td><LinkDistrito ubigeo={r.d.ubigeo}>{r.d.distrito}</LinkDistrito> <span className="text-ink3 text-xs">{r.d.provincia}, {r.d.departamento}</span></td><td className="text-right tabular-nums">{fmtInt(r.n)}</td><td className="text-right tabular-nums">{pct(r.a1)}</td><td className="text-right tabular-nums font-medium">{pct(r.c3)}</td><td className="text-right tabular-nums">{fmt(r.max, 4)}</td><td className="text-right tabular-nums">{r.d.reinfo_total}</td><td className="text-right tabular-nums">{r.d.pam_n}</td><td className="text-right tabular-nums">{r.d.emerg_n}</td></tr>)}
        </tbody></Tabla>
        <p className="mt-2 text-xs text-ink2">ECA Agua DS 004-2017-MINAM (verificado en el PDF oficial): As A1 0,01 / cat. 3 0,1 · Hg 0,001 / 0,001 · Pb 0,01 / 0,05 · Cd 0,003 / 0,01 mg/L. Los valores bajo el límite de detección cuentan como «cumple». Metales totales y disueltos se mezclan según el método reportado.</p>
      </Seccion>
      <Seccion titulo="Tecnologías de tratamiento aplicables (referencia)" aside={<Evidencia n="C" />}>
        <Panel><Tabla><thead><tr><th>Contaminante</th><th>Tecnología</th><th>Escala típica</th><th>Consideraciones</th></tr></thead><tbody>
          <tr><td>Arsénico</td><td>Coagulación-filtración con sales de hierro; adsorción en óxidos de hierro; ósmosis inversa; filtros con hierro cerovalente</td><td>Familiar a comunal (80–500 familias)</td><td>Oxidar As(III) a As(V); disponer el lodo arsenical; monitoreo trimestral.</td></tr>
          <tr><td>Mercurio</td><td>Carbón activado; coagulación; ósmosis inversa. Prioridad: eliminar la amalgamación y controlar el pescado.</td><td>Comunal</td><td>El riesgo principal es metilmercurio en la dieta, no en el agua.</td></tr>
          <tr><td>Plomo / cadmio</td><td>Ablandamiento con cal, intercambio iónico, ósmosis inversa</td><td>Comunal</td><td>Corregir pH evita lixiviación en tuberías.</td></tr>
          <tr><td>Microbiológico</td><td>Cloración, filtración lenta de arena, UV</td><td>Familiar a comunal</td><td>Base de todo sistema; cloro residual 0,5 mg/L.</td></tr>
        </tbody></Tabla><p className="mt-2 text-xs text-ink2">Referencia general (OMS, Guías para la calidad del agua de consumo humano, 4.ª ed.). El diseño exige caracterizar el agua local: ver el caso de Puerto Almendra.</p></Panel>
      </Seccion>
    </>
  )
}
