import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Titulo, Panel, Evidencia, Aviso, Cargando, Tabla, Seccion, pSig } from '../components/ui'
import { useData, useResumen, useAnalisis, fmt, fmtInt, pct } from '../lib/data'
import { CAT } from '../lib/colors'

interface Coef { var: string; label: string; beta: number; ci: [number, number]; p: number; r2_unico: number; spearman: number; spearman_p: number; tipo: 'socio' | 'ambiente' }
interface Modelo { n: number; r2: number; r2_adj: number; coef: Coef[] }
interface Factores { nota: string; resultados: { y: string; label: string; modelo_todos: Modelo; r2_socio: number; ganancia_ambiente: number; modelo_sedimentos?: Modelo }[] }

export default function Conclusiones() {
  const { data: f } = useData<Factores>('factores.json'); const { data: res } = useResumen(); const { data: an } = useAnalisis()
  const [y, setY] = useState('enla_lec_sat'); const [conSed, setConSed] = useState(false)
  if (!f || !res || !an) return <Cargando que="conclusiones" />
  const r = f.resultados.find(x => x.y === y) ?? f.resultados[0]
  const m = conSed && r.modelo_sedimentos ? r.modelo_sedimentos : r.modelo_todos
  const coef = [...m.coef].sort((a, b) => Math.abs(a.beta) - Math.abs(b.beta))
  const opt = {
    grid: { left: 230, right: 40, top: 10, bottom: 30 }, tooltip: { trigger: 'item', formatter: (p: { dataIndex: number }) => { const c = coef[p.dataIndex]; return `<b>${c.label}</b><br>β = ${fmt(c.beta, 2)} [${fmt(c.ci[0], 2)}, ${fmt(c.ci[1], 2)}] · ${pSig(c.p)}<br>R² único ${fmt(c.r2_unico * 100, 1)} % · ρ bivariada ${fmt(c.spearman, 2)}` } },
    xAxis: { type: 'value', name: 'β estandarizado', nameLocation: 'middle', nameGap: 20, splitLine: { lineStyle: { color: '#e6e9e6' } } },
    yAxis: { type: 'category', data: coef.map(c => c.label), axisLabel: { fontSize: 11 } },
    series: [{ type: 'bar', data: coef.map(c => ({ value: c.beta, itemStyle: { color: c.tipo === 'ambiente' ? CAT.mina : CAT.edu, opacity: c.p < 0.05 ? 1 : 0.35, borderRadius: 3 } })), barMaxWidth: 16, markLine: { silent: true, symbol: 'none', lineStyle: { color: '#888' }, data: [{ xAxis: 0 }] } }],
  }
  const top = an.pares.filter(p => p.activo && p.parcial != null).sort((a, b) => Math.abs(b.parcial!) - Math.abs(a.parcial!))[0]
  return (
    <>
      <Titulo sub="Lo que los datos permiten afirmar hoy, con su nivel de evidencia. Cada conclusión enlaza a la sección donde se puede comprobar.">Conclusiones</Titulo>
      <div className="grid gap-3 md:grid-cols-2">
        <Panel><Evidencia n="A" /><h3 className="mt-2 font-medium">El Perú retrocede en PISA 2025</h3><p className="mt-1 text-sm">Lectura cae de 408 a 390 puntos y matemática de 391 a 382 respecto a 2022; ciencias se mantiene en 406. Entre 58 % y 70 % de los estudiantes de 15 años no alcanza el nivel 2. La brecha estatal / no estatal persiste. <Link className="underline" to="/pisa">Ver serie y comparación mundial</Link>.</p></Panel>
        <Panel><Evidencia n="A" /><h3 className="mt-2 font-medium">El país está medido de forma muy desigual</h3><p className="mt-1 text-sm">INGEMMET muestreó sedimentos en {fmtInt(res.cobertura.sed)} de {fmtInt(res.n_distritos)} distritos, casi todos en costa y sierra; la Amazonía baja no tiene muestras. OEFA analizó metales en agua superficial en {fmtInt(res.oefa_agua?.distritos)} distritos, siempre donde hay actividad fiscalizada. Solo 54 análisis de agua de INGEMMET y ninguna serie pública de agua de consumo. <Link className="underline" to="/brechas">Ver brechas</Link>.</p></Panel>
        <Panel><Evidencia n="A" /><h3 className="mt-2 font-medium">Donde OEFA mide, el arsénico excede el estándar con frecuencia</h3><p className="mt-1 text-sm">26,7 % de los {fmtInt(res.oefa_agua?.muestras)} análisis de arsénico en agua superficial supera el ECA A1 (potabilizable con desinfección) y 8,7 % el de riego. Plomo 18,8 % y cadmio 18 % sobre A1; mercurio solo 1,6 %. Es muestreo dirigido: describe los puntos medidos, no el promedio del país. <Link className="underline" to="/agua">Ver agua segura</Link>.</p></Panel>
        <Panel><Evidencia n="A" /><h3 className="mt-2 font-medium">La exposición humana a metales existe y está documentada, pero en estudios puntuales</h3><p className="mt-1 text-sm">Mercurio en cabello en Madre de Dios (8 estudios revisados por pares desde 2010) y en el Nanay (79 % sobre la referencia OMS en 2024); arsénico en pozos del altiplano de Puno (hasta 446 µg/L) y en orina en Tacna. El registro de defunciones no lo capta: solo 4 muertes por intoxicación por metales en 1,6 millones de certificados. <Link className="underline" to="/casos">Ver casos</Link>.</p></Panel>
        <Panel><Evidencia n="B" /><h3 className="mt-2 font-medium">A escala distrital, la señal ambiental sobre salud y aprendizajes es pequeña</h3><p className="mt-1 text-sm">Ninguna de las {fmtInt(an.pares.length)} asociaciones ambiente↔resultado supera |r| = 0,2 tras controlar pobreza y geografía. La más consistente ({top?.x_label} ↔ {top?.y_label}, r parcial {fmt(top?.parcial, 2)}, n = {fmtInt(top?.n)}) cambia de signo entre departamentos. No prueba que no haya daño: prueba que el promedio distrital y los datos actuales no lo pueden ver. <Link className="underline" to="/relaciones">Ver relaciones</Link>.</p></Panel>
        <Panel><Evidencia n="B" /><h3 className="mt-2 font-medium">Los bajos resultados educativos son multifactoriales y dominan pobreza, ruralidad y conectividad</h3><p className="mt-1 text-sm">El modelo con variables socioeconómicas explica {pct(r.r2_socio * 100)} de la variación distrital en {r.label.toLowerCase()}; añadir todas las variables ambientales suma solo {fmt(r.ganancia_ambiente * 100, 1)} puntos. Detalle abajo.</p></Panel>
        <Panel><Evidencia n="C" /><h3 className="mt-2 font-medium">Hipótesis que merecen estudio de campo</h3><p className="mt-1 text-sm">Mercurio y cianuro en Nasca (20 plantas de beneficio y cero estudios); plomo en sangre infantil en distritos con muchos pasivos mineros; arsénico geogénico en pozos del altiplano y su relación con cáncer de piel y vejiga a 20 años. Ninguna se puede contrastar con datos públicos actuales. <Link className="underline" to="/casos">Ver casos</Link>.</p></Panel>
      </div>
      <Seccion titulo="¿Por qué son bajos los resultados? Un modelo multifactorial" aside={<Evidencia n="B" />}>
        <div className="flex flex-wrap gap-3 items-end mb-2">
          <label className="text-sm flex-1 min-w-[16rem]">Resultado<select className="mt-1 block w-full rounded border border-line bg-surface px-2 py-1.5" value={y} onChange={e => setY(e.target.value)}>{f.resultados.map(x => <option key={x.y} value={x.y}>{x.label}</option>)}</select></label>
          {r.modelo_sedimentos && <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={conSed} onChange={e => setConSed(e.target.checked)} /> incluir geoquímica de sedimentos (solo {fmtInt(r.modelo_sedimentos.n)} distritos muestreados)</label>}
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Panel className="p-2"><ReactECharts option={opt} style={{ height: 30 * coef.length + 60 }} notMerge /></Panel>
          <div className="space-y-3">
            <Panel><div className="text-sm text-ink2">Varianza explicada (R²)</div><div className="font-display text-3xl">{pct(m.r2 * 100)}</div><div className="text-sm text-ink2">{fmtInt(m.n)} distritos · R² ajustado {pct(m.r2_adj * 100)}</div><div className="mt-2 text-sm">Solo socioeconómico: <strong>{pct(r.r2_socio * 100)}</strong><br />Ganancia por lo ambiental: <strong>{fmt(r.ganancia_ambiente * 100, 1)} pp</strong></div></Panel>
            <Panel><div className="text-sm">Barras <span style={{ color: CAT.edu }}>■</span> socioeconómicas y <span style={{ color: CAT.mina }}>■</span> ambientales; atenuadas si p ≥ 0,05. β = cambio en desviaciones estándar del resultado por una desviación estándar de la variable, con las demás fijas.</div></Panel>
          </div>
        </div>
        <Tabla className="mt-3"><thead><tr><th>Variable</th><th className="text-right">β</th><th className="text-right">IC 95 %</th><th className="text-right">p</th><th className="text-right">R² único</th><th className="text-right">ρ bivariada</th></tr></thead><tbody>
          {[...m.coef].map(c => <tr key={c.var} className={c.tipo === 'ambiente' ? 'text-mina' : ''}><td>{c.label}</td><td className="text-right tabular-nums">{fmt(c.beta, 2)}</td><td className="text-right tabular-nums">[{fmt(c.ci[0], 2)}, {fmt(c.ci[1], 2)}]</td><td className="text-right tabular-nums">{pSig(c.p)}</td><td className="text-right tabular-nums">{pct(c.r2_unico * 100)}</td><td className="text-right tabular-nums">{fmt(c.spearman, 2)}</td></tr>)}
        </tbody></Tabla>
        <Aviso>Lectura: en lectura de 4.º de primaria pesan más el acceso a internet y desagüe, la menor pobreza y la altitud (la sierra rinde mejor que la selva a igual pobreza). Las variables ambientales tienen coeficientes pequeños o no significativos. Un R² de 30 % también dice que 70 % de la variación entre distritos no está en estas variables: docentes, gestión escolar, lengua materna, nutrición temprana y calidad del agua de consumo, que no tenemos por distrito. Nada aquí es causal.</Aviso>
      </Seccion>
      <Seccion titulo="Lo que este observatorio no puede concluir">
        <ul className="list-disc pl-5 text-sm space-y-1 max-w-3xl">
          <li>Que la contaminación cause (o no cause) daño en una persona o comunidad concreta: la unidad es el distrito.</li>
          <li>Cuántas personas beben agua con arsénico o mercurio: no hay dato abierto de agua de consumo.</li>
          <li>Que un distrito sin registros esté limpio: puede estar sin medir.</li>
          <li>Qué parte de la mortalidad es atribuible a la exposición: las tasas son crudas y el certificado no registra exposición crónica.</li>
        </ul>
      </Seccion>
    </>
  )
}
