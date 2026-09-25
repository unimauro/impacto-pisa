import { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Titulo, Panel, Evidencia, Aviso, Cargando, Tabla, Error as Err, pSig, Seccion } from '../components/ui'
import { useDistritos, useAnalisis, fmt, fmtInt } from '../lib/data'
import { CAT, DIVERGING } from '../lib/colors'
import type { Par } from '../lib/types'

const AMB_X: Record<string, (d: Record<string, unknown>) => number | null> = {
  log_sed_as_med: d => (d.sed_as_n as number ?? 0) >= 3 && (d.sed_as_med as number) > 0 ? Math.log10(d.sed_as_med as number) : null,
  sed_as_pct_pel: d => (d.sed_as_n as number ?? 0) >= 3 ? (d.sed_as_pct_pel as number ?? null) : null,
  log_sed_hg_med: d => (d.sed_hg_n as number ?? 0) >= 3 && (d.sed_hg_med as number) > 0 ? Math.log10(d.sed_hg_med as number) : null,
  log_sed_pb_med: d => (d.sed_pb_n as number ?? 0) >= 3 && (d.sed_pb_med as number) > 0 ? Math.log10(d.sed_pb_med as number) : null,
  log_sed_cd_med: d => (d.sed_cd_n as number ?? 0) >= 3 && (d.sed_cd_med as number) > 0 ? Math.log10(d.sed_cd_med as number) : null,
  reinfo_por_10k: d => d.pob ? (d.reinfo_total as number) / (d.pob as number) * 1e4 : null,
  reinfo_vig_por_10k: d => d.pob ? (d.reinfo_vigente as number) / (d.pob as number) * 1e4 : null,
  pam_por_10k: d => d.pob ? (d.pam_n as number) / (d.pob as number) * 1e4 : null,
  um_n: d => d.um_n as number,
}
const fuerza = (r: number) => Math.abs(r) < 0.1 ? 'despreciable' : Math.abs(r) < 0.3 ? 'débil' : Math.abs(r) < 0.5 ? 'moderada' : 'fuerte'

export default function Relaciones() {
  const { data: dist, error } = useDistritos(); const { data: an } = useAnalisis()
  const [x, setX] = useState('log_sed_as_med'); const [y, setY] = useState('enla_lec_sat')
  const xs = useMemo(() => an ? [...new Set(an.pares.map(p => p.x))] : [], [an]); const ys = useMemo(() => an ? [...new Set(an.pares.map(p => p.y))] : [], [an])
  const par = an?.pares.find(p => p.x === x && p.y === y)
  const pts = useMemo(() => { if (!dist || !par) return []; return dist.map(d => { const vx = AMB_X[x]?.(d); const vy = d[y] as number | null; if (vx == null || vy == null || !Number.isFinite(vx) || !Number.isFinite(vy)) return null; if (y.startsWith('tasa_') && ((d.pob ?? 0) < 5000)) return null; return [vx, vy, d.distrito, d.departamento, d.pob] }).filter(Boolean) as (number | string)[][] }, [dist, par, x, y])
  if (error) return <Err msg={error} />
  if (!an || !dist) return <Cargando que="análisis" />
  const lab = (id: string) => an.matriz.labels[id] ?? id
  const scatter = {
    grid: { left: 56, right: 16, top: 16, bottom: 44 }, tooltip: { trigger: 'item', formatter: (p: { value: (number | string)[] }) => `<b>${p.value[2]}</b> (${p.value[3]})<br>${lab(x)}: ${fmt(p.value[0] as number, 2)}<br>${lab(y)}: ${fmt(p.value[1] as number, 1)}<br>pob. ${fmtInt(p.value[4] as number)}` },
    xAxis: { name: lab(x), nameLocation: 'middle', nameGap: 28, type: 'value', scale: true, splitLine: { lineStyle: { color: '#e6e9e6' } } },
    yAxis: { name: lab(y), nameLocation: 'middle', nameGap: 42, type: 'value', scale: true, splitLine: { lineStyle: { color: '#e6e9e6' } } },
    series: [{ type: 'scatter', data: pts, symbolSize: 7, itemStyle: { color: y.startsWith('enla') ? CAT.edu : CAT.salud, opacity: 0.55, borderColor: '#fff', borderWidth: 0.5 } }],
  }
  const M = an.matriz; const heat = M.rho.flatMap((row, i) => row.map((v, j) => [j, i, v])).filter(c => c[2] != null)
  const matrix = {
    grid: { left: 210, right: 16, top: 8, bottom: 140 }, tooltip: { formatter: (p: { value: number[] }) => `${lab(M.vars[p.value[1]])}<br>× ${lab(M.vars[p.value[0]])}<br>ρ Spearman = ${fmt(p.value[2], 2)} · n = ${fmtInt(M.n[p.value[1]][p.value[0]])}` },
    xAxis: { type: 'category', data: M.vars.map(v => an.matriz.labels[v]?.slice(0, 34) ?? v), axisLabel: { rotate: 55, fontSize: 10, interval: 0 } },
    yAxis: { type: 'category', data: M.vars.map(v => an.matriz.labels[v]?.slice(0, 40) ?? v), axisLabel: { fontSize: 10, interval: 0 } },
    visualMap: { min: -0.6, max: 0.6, calculable: true, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: DIVERGING }, text: ['+', '−'] },
    series: [{ type: 'heatmap', data: heat, label: { show: true, fontSize: 8, formatter: (p: { value: number[] }) => fmt(p.value[2], 1) }, itemStyle: { borderColor: '#fff', borderWidth: 1 } }],
  }
  const ranking = an.pares.filter(p => p.activo && p.parcial != null).sort((a, b) => Math.abs(b.parcial!) - Math.abs(a.parcial!))
  return (
    <>
      <Titulo sub="Elige una variable ambiental y una educativa o sanitaria. Verás la correlación simple, la correlación parcial (controlando pobreza, altitud, población, agua e internet), el modelo de regresión y la heterogeneidad por departamento. Todo con su tamaño de muestra.">¿Qué relaciones tienen respaldo en los datos?</Titulo>
      <Aviso tipo="alerta">Unidad de análisis: el distrito. Una asociación distrital no dice nada sobre personas concretas (falacia ecológica) ni prueba causalidad. Los sedimentos de INGEMMET (2000–2018) describen la cuenca, no el agua de consumo; y ENLA/SINADEF son de 2019–2025.</Aviso>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div>
          <div className="flex flex-wrap gap-3 mb-2">
            <label className="text-sm flex-1 min-w-[14rem]">Variable ambiental (eje X)<select className="mt-1 block w-full rounded border border-line bg-surface px-2 py-1.5" value={x} onChange={e => setX(e.target.value)}>{xs.map(v => <option key={v} value={v}>{lab(v)}</option>)}</select></label>
            <label className="text-sm flex-1 min-w-[14rem]">Resultado (eje Y)<select className="mt-1 block w-full rounded border border-line bg-surface px-2 py-1.5" value={y} onChange={e => setY(e.target.value)}>{ys.map(v => <option key={v} value={v}>{lab(v)}</option>)}</select></label>
          </div>
          <Panel className="p-2"><ReactECharts option={scatter} style={{ height: 440 }} notMerge /></Panel>
          <p className="mt-1 text-xs text-ink2">Cada punto es un distrito ({fmtInt(pts.length)} con ambas variables). Para mortalidad solo distritos con ≥ 5 000 habitantes.</p>
        </div>
        <aside>{par && <Resultado p={par} />}</aside>
      </div>
      <Seccion titulo="Ranking de asociaciones (correlación parcial)" aside={<Evidencia n="B" />}>
        <Tabla><thead><tr><th>Ambiental</th><th>Resultado</th><th className="text-right">n</th><th className="text-right">ρ Spearman</th><th className="text-right">r parcial</th><th className="text-right">p</th><th>Lectura</th></tr></thead><tbody>
          {ranking.slice(0, 25).map(p => <tr key={p.x + p.y} className="cursor-pointer hover:bg-ground" onClick={() => { setX(p.x); setY(p.y); window.scrollTo({ top: 0 }) }}><td>{p.x_label}</td><td>{p.y_label}</td><td className="text-right tabular-nums">{fmtInt(p.n)}</td><td className="text-right tabular-nums">{fmt(p.spearman, 2)}</td><td className="text-right tabular-nums font-medium">{fmt(p.parcial, 2)}</td><td className="text-right tabular-nums">{pSig(p.parcial_p)}</td><td className="text-ink2">{fuerza(p.parcial!)}{p.parcial_p! < 0.01 && Math.abs(p.parcial!) >= 0.1 ? ', significativa' : ''}</td></tr>)}
        </tbody></Tabla>
        <p className="mt-2 text-xs text-ink2">Con más de 100 pruebas, algunas resultarán significativas por azar (ajuste de Bonferroni: p &lt; 0,0005). Ninguna correlación aquí supera |r| = 0,35: la señal ambiental, si existe, es pequeña frente a la pobreza y la ruralidad.</p>
      </Seccion>
      <Seccion titulo="Matriz de correlaciones (Spearman)">
        <Panel className="p-2"><ReactECharts option={matrix} style={{ height: 720 }} /></Panel>
        <p className="mt-1 text-xs text-ink2">Pares con menos de {an.n_min} distritos en común no se calculan. Verdigris = correlación negativa, óxido = positiva.</p>
      </Seccion>
      <Seccion titulo="Advertencias metodológicas"><ul className="list-disc pl-5 text-sm space-y-1">{an.advertencias.map(a => <li key={a}>{a}</li>)}</ul></Seccion>
    </>
  )
}

function Resultado({ p }: { p: Par }) {
  if (!p.activo) return <Panel><Evidencia n="D" /><p className="mt-2 text-sm">Análisis desactivado: {p.motivo}.</p></Panel>
  const sig = (p.parcial_p ?? 1) < 0.01 && Math.abs(p.parcial ?? 0) >= 0.1
  return (
    <div className="space-y-3">
      <Panel>
        <div className="flex items-center justify-between"><span className="text-sm text-ink2">Veredicto</span><Evidencia n={sig ? 'B' : 'C'}>{sig ? 'Asociación estadística' : 'Sin asociación demostrada'}</Evidencia></div>
        <p className="mt-2 text-sm">{sig ? <>Tras controlar por {p.parcial_ctrl?.join(', ')}, la asociación es <strong>{fuerza(p.parcial!)}</strong> ({p.parcial! > 0 ? 'positiva' : 'negativa'}, r parcial = {fmt(p.parcial, 2)}, {pSig(p.parcial_p)}) en {fmtInt(p.n)} distritos.</> : <>Con {fmtInt(p.n)} distritos y controlando por {p.parcial_ctrl?.join(', ')}, no hay una asociación distinguible del azar o es despreciable (r parcial = {fmt(p.parcial, 2)}, {pSig(p.parcial_p)}).</>} Esto {sig ? 'justifica investigar con datos individuales y de exposición real' : 'no descarta efectos locales que el promedio distrital oculta'}.</p>
      </Panel>
      <Panel>
        <div className="text-sm text-ink2 mb-1">Estadísticos</div>
        <Tabla><tbody>
          <tr><td>Distritos (n)</td><td className="text-right tabular-nums">{fmtInt(p.n)}</td></tr>
          <tr><td>Pearson r [IC 95 % bootstrap]</td><td className="text-right tabular-nums">{fmt(p.pearson, 2)} [{fmt(p.pearson_ci?.[0], 2)}, {fmt(p.pearson_ci?.[1], 2)}]</td></tr>
          <tr><td>Spearman ρ [IC 95 %]</td><td className="text-right tabular-nums">{fmt(p.spearman, 2)} [{fmt(p.spearman_ci?.[0], 2)}, {fmt(p.spearman_ci?.[1], 2)}]</td></tr>
          <tr><td>r parcial</td><td className="text-right tabular-nums">{fmt(p.parcial, 2)} · {pSig(p.parcial_p)}</td></tr>
          {p.ols && <><tr><td>OLS β (HC3) [IC 95 %]</td><td className="text-right tabular-nums">{fmt(p.ols.beta, 3)} [{fmt(p.ols.ci[0], 3)}, {fmt(p.ols.ci[1], 3)}]</td></tr><tr><td>R² del modelo</td><td className="text-right tabular-nums">{fmt(p.ols.r2, 2)}</td></tr></>}
        </tbody></Tabla>
        <p className="mt-2 text-xs text-ink2">Fuentes: {p.x_fuente} · {p.y_fuente}. Tipo de variable ambiental: {p.x_tipo}.</p>
      </Panel>
      {p.por_departamento && p.por_departamento.length > 0 && <Panel>
        <div className="text-sm text-ink2 mb-1">Por departamento (Spearman, n ≥ 15)</div>
        <Tabla><tbody>{[...p.por_departamento].sort((a, b) => Math.abs(b.spearman) - Math.abs(a.spearman)).map(d => <tr key={d.dep}><td>{d.dep}</td><td className="text-right tabular-nums">{fmtInt(d.n)}</td><td className="text-right tabular-nums">{fmt(d.spearman, 2)}</td><td className="text-right tabular-nums text-ink2">{pSig(d.p)}</td></tr>)}</tbody></Tabla>
        <p className="mt-1 text-xs text-ink2">Si el signo cambia entre departamentos, la relación nacional puede ser un artefacto de la geografía (paradoja de Simpson).</p>
      </Panel>}
    </div>
  )
}
