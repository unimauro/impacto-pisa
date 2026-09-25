import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import Mapa, { Leyenda } from '../components/Mapa'
import { Titulo, Panel, Evidencia, Aviso, Cargando, Tabla, Error as Err, Seccion } from '../components/ui'
import { useDistritos, useResumen, fmt, fmtInt, quantiles, VARS } from '../lib/data'
import { RAMPAS, colorScale, CAT } from '../lib/colors'

const CAUSAS = VARS.filter(v => v.dominio === 'salud')
export default function Salud() {
  const { data: dist, error } = useDistritos(); const { data: res } = useResumen(); const nav = useNavigate()
  const [causa, setCausa] = useState('tasa_renal'); const [capa, setCapa] = useState<'reinfo' | 'pam' | 'as'>('as')
  const v = CAUSAS.find(c => c.id === causa)!
  const idx = useMemo(() => new Map(dist?.map(d => [d.ubigeo, v.get(d)])), [dist, v])
  const vals = useMemo(() => [...idx.values()].filter((x): x is number => x != null), [idx])
  const breaks = useMemo(() => vals.length ? quantiles(vals, [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6]) : [], [vals])
  const color = useMemo(() => colorScale(RAMPAS.salud, breaks), [breaks])
  const byU = useMemo(() => new Map(dist?.map(d => [d.ubigeo, d])), [dist])
  const puntos = useMemo(() => dist?.filter(d => capa === 'reinfo' ? d.reinfo_total >= 20 : capa === 'pam' ? d.pam_n >= 10 : ((d.sed_as_n ?? 0) >= 3 && (d.sed_as_pct_pel ?? 0) >= 50)).map(d => ({ lon: 0, lat: 0, ubigeo: d.ubigeo })), [dist, capa])
  // comparación: distritos con alta presión minera vs resto (mismo quintil de pobreza)
  const comp = useMemo(() => {
    if (!dist) return null
    const ok = dist.filter(d => (d.pob ?? 0) >= 5000 && d.pobreza != null && typeof d[causa] === 'number')
    const q = quantiles(ok.map(d => d.pobreza!), [0.2, 0.4, 0.6, 0.8])
    const quint = (p: number) => q.findIndex(b => p <= b) === -1 ? 4 : q.findIndex(b => p <= b)
    const exp = (d: (typeof ok)[0]) => capa === 'reinfo' ? d.reinfo_total / (d.pob ?? 1) * 1e4 >= 5 : capa === 'pam' ? d.pam_n >= 5 : ((d.sed_as_n ?? 0) >= 3 && (d.sed_as_pct_pel ?? 0) >= 50)
    const rows = [0, 1, 2, 3, 4].map(k => { const g = ok.filter(d => quint(d.pobreza!) === k); const a = g.filter(exp); const b = g.filter(d => !exp(d)); const med = (arr: typeof g) => { const s = arr.map(d => d[causa] as number).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null }; return { k, nA: a.length, nB: b.length, mA: med(a), mB: med(b) } })
    return rows
  }, [dist, causa, capa])
  if (error) return <Err msg={error} />
  const capaLabel = { reinfo: 'REINFO ≥ 5 por 10 mil hab.', pam: '≥ 5 pasivos mineros', as: '≥ 50 % de muestras con As > PEL' }[capa]
  const bar = comp && {
    grid: { left: 48, right: 12, top: 28, bottom: 28 }, legend: { top: 0, data: [`Expuestos: ${capaLabel}`, 'Resto'] }, tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Q1 menos pobre', 'Q2', 'Q3', 'Q4', 'Q5 más pobre'] }, yAxis: { type: 'value', name: 'mediana por 100 mil', splitLine: { lineStyle: { color: '#e6e9e6' } } },
    series: [{ name: `Expuestos: ${capaLabel}`, type: 'bar', data: comp.map(r => r.mA), itemStyle: { color: CAT.mina, borderRadius: [3, 3, 0, 0] }, label: { show: true, position: 'top', fontSize: 10, formatter: (p: { dataIndex: number }) => `n=${comp[p.dataIndex].nA}` } },
      { name: 'Resto', type: 'bar', data: comp.map(r => r.mB), itemStyle: { color: CAT.salud, borderRadius: [3, 3, 0, 0] }, label: { show: true, position: 'top', fontSize: 10, formatter: (p: { dataIndex: number }) => `n=${comp[p.dataIndex].nB}` } }],
  }
  return (
    <>
      <Titulo sub="Mortalidad registrada por causa (SINADEF, domicilio del fallecido, 2019–2025) sobre el mapa de presión minera y geoquímica. Las tasas son crudas: no están ajustadas por edad y reflejan el subregistro de cada distrito.">Salud y contaminación</Titulo>
      <Aviso tipo="alerta">Ninguna cifra aquí es una muerte «atribuible» a contaminación. Son defunciones registradas con una causa básica CIE-10. Las intoxicaciones por metales (T56) como causa básica suman {res ? fmtInt(res.sinadef.t56_total_2017_2026) : '…'} en todo el país 2017–2026: la exposición crónica no se ve en el certificado de defunción.</Aviso>
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="text-sm flex-1 min-w-[16rem]">Causa<select className="mt-1 block w-full rounded border border-line bg-surface px-2 py-1.5" value={causa} onChange={e => setCausa(e.target.value)}>{CAUSAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
        <label className="text-sm">Capa de exposición (contorno)<select className="mt-1 block rounded border border-line bg-surface px-2 py-1.5" value={capa} onChange={e => setCapa(e.target.value as typeof capa)}><option value="as">Arsénico alto en sedimentos</option><option value="reinfo">Alta densidad REINFO</option><option value="pam">Muchos pasivos mineros</option></select></label>
      </div>
      <div className="mt-3">{dist ? <Mapa height="60vh" valor={u => idx.get(u) ?? null} color={color} onClick={u => nav(`/distrito/${u}`)} seleccion={null}
        tooltip={(u, nm) => { const d = byU.get(u); const x = idx.get(u); return `<b>${nm}</b><br>${v.corto}: ${x == null ? (d?.tasa_inestable ? 'población < 5 mil' : 'sin dato') : fmt(x) + ' por 100 mil'}<br>REINFO ${d?.reinfo_total ?? 0} · PAM ${d?.pam_n ?? 0} · As>PEL ${d?.sed_as_pct_pel != null ? fmt(d.sed_as_pct_pel) + ' %' : '—'}` }} /> : <Cargando que="mapa" />}</div>
      <div className="mt-2"><Leyenda steps={RAMPAS.salud} breaks={breaks} unidad={v.unidad} fmt={x => fmt(x)} titulo={v.label} /></div>
      <p className="mt-1 text-xs text-ink2">{fmtInt(puntos?.length ?? 0)} distritos cumplen el criterio de exposición «{capaLabel}» (se comparan abajo).</p>
      <Seccion titulo="Territorios comparables: expuestos vs. resto, por quintil de pobreza" aside={<Evidencia n="B" />}>
        <Panel className="p-2">{bar && <ReactECharts option={bar} style={{ height: 320 }} notMerge />}</Panel>
        <p className="mt-2 text-sm text-ink2">Compara la mediana de la tasa en distritos «expuestos» contra el resto dentro del mismo quintil de pobreza (solo distritos ≥ 5 000 hab.). Si las barras se parecen en todos los quintiles, la pobreza explica más que la exposición. Diferencias con n pequeño no son concluyentes.</p>
        {comp && <Tabla className="mt-2"><thead><tr><th>Quintil de pobreza</th><th className="text-right">n expuestos</th><th className="text-right">mediana expuestos</th><th className="text-right">n resto</th><th className="text-right">mediana resto</th><th className="text-right">razón</th></tr></thead><tbody>{comp.map(r => <tr key={r.k}><td>Q{r.k + 1}</td><td className="text-right tabular-nums">{r.nA}</td><td className="text-right tabular-nums">{fmt(r.mA)}</td><td className="text-right tabular-nums">{r.nB}</td><td className="text-right tabular-nums">{fmt(r.mB)}</td><td className="text-right tabular-nums">{r.mA != null && r.mB ? fmt(r.mA / r.mB, 2) : '—'}</td></tr>)}</tbody></Tabla>}
      </Seccion>
      <Seccion titulo="Lo que la literatura asocia y lo que estos datos pueden ver" aside={<Evidencia n="C" />}>
        <Tabla><thead><tr><th>Contaminante</th><th>Efectos documentados (OMS/IARC)</th><th>Qué se ve en SINADEF</th><th>Qué haría falta</th></tr></thead><tbody>
          <tr><td>Arsénico (agua)</td><td>Cáncer de piel, vejiga y pulmón; lesiones cutáneas; enfermedad cardiovascular; efectos en neurodesarrollo.</td><td>Mortalidad por cáncer de piel / vejiga-riñón / pulmón (tasas crudas, latencia 10–30 años).</td><td>As en agua de consumo por localidad (DIGESA), As en orina (INS).</td></tr>
          <tr><td>Mercurio (minería aurífera)</td><td>Neurotoxicidad, daño renal, efectos en el desarrollo fetal (metilmercurio en pescado).</td><td>Mortalidad renal y del sistema nervioso; no distingue causa.</td><td>Hg en cabello/sangre por comunidad (CINCIA, INS); Hg en peces (IMARPE/PRODUCE).</td></tr>
          <tr><td>Plomo (fundiciones, relaves)</td><td>Daño cognitivo irreversible en niños, anemia, hipertensión, daño renal.</td><td>Casi invisible: no causa muerte codificable a corto plazo.</td><td>Plomo en sangre en niños (CENSOPAS), rendimiento escolar individual.</td></tr>
          <tr><td>Cadmio</td><td>Daño renal, osteoporosis, cáncer (IARC 1).</td><td>Mortalidad renal.</td><td>Cd en orina; Cd en cultivos (SENASA).</td></tr>
          <tr><td>Hidrocarburos (derrames)</td><td>Dermatitis, efectos respiratorios, contaminación de pescado.</td><td>Mortalidad dermatológica/respiratoria (muy inespecífica).</td><td>Monitoreo participativo OEFA/federaciones por comunidad.</td></tr>
        </tbody></Tabla>
      </Seccion>
    </>
  )
}
