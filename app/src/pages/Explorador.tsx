import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Titulo, Panel, Kpi, Evidencia, Aviso, Cargando, Tabla, Error as Err } from '../components/ui'
import Mapa from '../components/Mapa'
import { useDistritos, useResumen, fmt, fmtInt, pct, VARS } from '../lib/data'
import { CAT } from '../lib/colors'
import type { Distrito } from '../lib/types'

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function Explorador() {
  const { ubigeo } = useParams(); const nav = useNavigate()
  const { data: dist, error } = useDistritos(); const { data: res } = useResumen()
  const [q, setQ] = useState('')
  const d = useMemo(() => dist?.find(x => x.ubigeo === ubigeo), [dist, ubigeo])
  const hits = useMemo(() => { if (!dist || q.length < 2) return []; const n = norm(q); return dist.filter(x => norm(`${x.distrito} ${x.provincia} ${x.departamento} ${x.ubigeo}`).includes(n)).slice(0, 12) }, [dist, q])
  const nac = useMemo(() => { if (!dist) return null; const med = (k: string) => { const v = dist.map(x => x[k]).filter((x): x is number => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null }; return { enla_lec_sat: med('enla_lec_sat'), enla_mat_sat: med('enla_mat_sat'), tasa_renal: med('tasa_renal'), tasa_cancer: med('tasa_cancer'), tasa_hepatica: med('tasa_hepatica'), pobreza: med('pobreza'), sed_as_med: med('sed_as_med'), sed_hg_med: med('sed_hg_med'), sed_pb_med: med('sed_pb_med') } }, [dist])
  if (error) return <Err msg={error} />
  return (
    <>
      <Titulo sub="Busca un distrito para ver su perfil completo: fuentes de contaminación documentadas, resultados de laboratorio, mortalidad, aprendizajes, gasto público y, sobre todo, qué información falta.">Explorador territorial</Titulo>
      <div className="relative max-w-xl">
        <label className="text-sm">Distrito, provincia, departamento o UBIGEO
          <input className="mt-1 block w-full rounded border border-line bg-surface px-3 py-2" value={q} onChange={e => setQ(e.target.value)} placeholder="Ej. Nasca, Iquitos, Huepetuhe, 150101" autoComplete="off" /></label>
        {hits.length > 0 && <ul className="absolute z-30 mt-1 w-full rounded border border-line bg-surface shadow-sm max-h-72 overflow-auto">{hits.map(h => <li key={h.ubigeo}><button className="w-full text-left px-3 py-1.5 hover:bg-ground" onClick={() => { nav(`/distrito/${h.ubigeo}`); setQ('') }}>{h.distrito} <span className="text-ink2">· {h.provincia}, {h.departamento} · {h.ubigeo}</span></button></li>)}</ul>}
      </div>
      {!dist && <Cargando />}
      {dist && !d && <p className="mt-6 text-ink2">Escribe un nombre para empezar, o elige un distrito en el <a className="underline" href="#/">mapa del panorama</a>.</p>}
      {d && nac && <Perfil d={d} nac={nac} refs={res?.referencias} />}
    </>
  )
}

function Perfil({ d, nac, refs }: { d: Distrito; nac: Record<string, number | null>; refs?: Record<string, { eca_suelo_agr: number; ccme_pel: number }> }) {
  const serie = d.def_serie ? Object.entries(d.def_serie).filter(([y]) => +y >= 2017).sort() : []
  const n = (k: string) => (typeof d[k] === 'number' ? (d[k] as number) : null)
  const fuentesDoc = [
    ['Emergencias ambientales atendidas por OEFA', d.emerg_n, d.emerg_n ? `${d.emerg_hc_n} de hidrocarburos, ${d.emerg_min_n} de minería · ${d.emerg_anios ?? ''}` : '', 'OEFA ODES 2011–2026'],
    ['Área de minería ilegal identificada', n('min_ilegal_ha') ? Math.round(n('min_ilegal_ha')!) : 0, n('min_ilegal_ha') ? 'hectáreas intersectadas con el distrito (UFAFEMA-PPO, GORE, REINFO excluido)' : '', 'OEFA PIFA'],
    ['Área de minería informal (REINFO)', n('min_informal_ha') ? Math.round(n('min_informal_ha')!) : 0, n('min_informal_ha') ? 'hectáreas declaradas por inscritos' : '', 'OEFA PIFA'],
    ['Registros REINFO (mineros en formalización)', d.reinfo_total, `${d.reinfo_vigente} vigentes, ${d.reinfo_suspendido} suspendidos, ${d.reinfo_beneficio} plantas de beneficio`, 'MINEM vía GEOCATMIN'],
    ['Pasivos ambientales mineros', d.pam_n, `${d.pam_residuo_n} son residuos (relaves, desmontes)`, 'MINEM'],
    ['Unidades mineras formales', d.um_n, `${d.um_produccion_n} en producción`, 'MINEM/OSINERGMIN'],
    ['Depósitos de relaves supervisados', d.relaves_n, '', 'OEFA'],
    ['Puntos de minería ilegal dentro de ANP', d.mineria_ilegal_anp_n, 'Solo áreas naturales protegidas', 'SERNANP'],
    ['Pasivos de hidrocarburos', d.pasivos_hc_n, '', 'OEFA'],
    ['Lotes petroleros', d.lotes_hc_n, '', 'OSINERGMIN/Perupetro'],
    ['Unidades con riesgo ambiental alto/muy alto', d.riesgo_oefa_alto_n, '', 'OEFA'],
  ] as const
  const sedRows = (['as', 'hg', 'pb', 'cd', 'cu'] as const).map(el => ({ el, nombre: { as: 'Arsénico', hg: 'Mercurio', pb: 'Plomo', cd: 'Cadmio', cu: 'Cobre' }[el], unidad: el === 'hg' ? 'ppb' : 'ppm', n: n(`sed_${el}_n`), med: n(`sed_${el}_med`), p90: n(`sed_${el}_p90`), max: n(`sed_${el}_max`), pel: n(`sed_${el}_pct_pel`), ref: refs?.[el] }))
  const opt = {
    grid: { left: 40, right: 12, top: 10, bottom: 24 }, tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: serie.map(([y]) => y), axisLine: { lineStyle: { color: '#c8ccc9' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#e6e9e6' } } },
    series: [{ type: 'bar', data: serie.map(([, v]) => v), itemStyle: { color: CAT.salud, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 28 }],
  }
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="text-3xl font-medium">{d.distrito}</h2><span className="text-ink2">{d.provincia}, {d.departamento} · UBIGEO {d.ubigeo}</span>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Panel>
            <h3 className="font-medium mb-2">Perfil</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <Kpi v={fmtInt(d.pob)} l="habitantes" nota="INEI, proyección" />
              <Kpi v={pct(d.pobreza)} l="pobreza monetaria" nota={`nacional (mediana distrital) ${pct(nac.pobreza)}`} />
              <Kpi v={fmt(d.idh)} l="IDH 2019 (x100)" nota="PNUD" />
              <Kpi v={fmtInt(d.altitud)} l="m s. n. m." nota="capital distrital" />
              <Kpi v={pct(d.agua_red)} l="viviendas con agua de red" nota="Censo 2017 (acceso, no calidad)" />
              <Kpi v={pct(d.desague_red)} l="con desagüe de red" nota="Censo 2017" />
              <Kpi v={n('gasto_dev_pc_2025') != null ? `S/ ${fmtInt(n('gasto_dev_pc_2025'))}` : '—'} l="gasto público ejecutado por habitante, 2025" nota="SIAF-MEF (ubicación de la unidad ejecutora)" />
            </div>
          </Panel>
          <Panel>
            <div className="flex items-baseline justify-between"><h3 className="font-medium">Fuentes de contaminación documentadas</h3><Evidencia n="A">Inventarios oficiales</Evidencia></div>
            <Tabla className="mt-2"><thead><tr><th>Inventario</th><th className="text-right">n</th><th>Detalle</th><th>Fuente</th></tr></thead><tbody>
              {fuentesDoc.map(([l, v, det, f]) => <tr key={l} className={v ? '' : 'text-ink3'}><td>{l}</td><td className="text-right tabular-nums">{fmtInt(v)}</td><td>{v ? det : 'sin registro en este inventario'}</td><td className="text-ink2">{f}</td></tr>)}
            </tbody></Tabla>
            <p className="mt-2 text-xs text-ink2">Un registro REINFO no prueba minería ilegal ni contaminación; un cero significa que el inventario no tiene registros aquí, no que no exista actividad.</p>
          </Panel>
          <Panel>
            <div className="flex items-baseline justify-between"><h3 className="font-medium">Geoquímica de sedimentos de quebrada</h3>{d.sed_n ? <Evidencia n="A">{fmtInt(d.sed_n)} muestras · {d.sed_anios}</Evidencia> : <Evidencia n="D" />}</div>
            {d.sed_n ? <>
              <Tabla className="mt-2"><thead><tr><th>Elemento</th><th className="text-right">n</th><th className="text-right">mediana</th><th className="text-right">p90</th><th className="text-right">máx.</th><th className="text-right">% &gt; PEL</th><th className="text-right">ref. PEL / ECA suelo</th></tr></thead><tbody>
                {sedRows.map(r => <tr key={r.el}><td>{r.nombre} <span className="text-ink3">({r.unidad})</span></td><td className="text-right tabular-nums">{fmtInt(r.n)}</td><td className="text-right tabular-nums">{fmt(r.med, 2)}</td><td className="text-right tabular-nums">{fmt(r.p90, 2)}</td><td className="text-right tabular-nums">{fmt(r.max, 2)}</td><td className="text-right tabular-nums">{r.pel != null ? pct(r.pel) : '—'}</td><td className="text-right tabular-nums text-ink2">{r.ref ? `${r.ref.ccme_pel} / ${r.ref.eca_suelo_agr}` : '—'}</td></tr>)}
              </tbody></Tabla>
              <p className="mt-2 text-xs text-ink2">INGEMMET, programa nacional de geoquímica (muestreos {d.sed_anios}). Describe la cuenca (geología natural + actividad humana); no es agua de consumo. PEL = nivel de efecto probable CCME (Canadá) para sedimentos de agua dulce; ECA suelo agrícola DS 011-2017-MINAM, ambos solo como referencia orientativa. Mediana nacional distrital: As {fmt(nac.sed_as_med, 1)} ppm, Hg {fmt(nac.sed_hg_med, 0)} ppb, Pb {fmt(nac.sed_pb_med, 0)} ppm.</p>
            </> : <p className="mt-2 text-sm text-ink2">INGEMMET no tiene muestras de sedimento georreferenciadas dentro de este distrito. Eso no significa que no haya contaminación: significa que no se ha medido.</p>}
          </Panel>
          <Panel>
            <div className="flex items-baseline justify-between"><h3 className="font-medium">Calidad del agua superficial medida por OEFA</h3>{d.oefa_agua_n ? <Evidencia n="A">{fmtInt(d.oefa_agua_n)} análisis · {d.oefa_agua_anios}</Evidencia> : <Evidencia n="D" />}</div>
            {d.oefa_agua_n ? <>
              <Tabla className="mt-2"><thead><tr><th>Metal</th><th className="text-right">análisis</th><th className="text-right">% &gt; ECA A1</th><th className="text-right">% &gt; ECA cat. 3</th><th className="text-right">máx. (mg/L)</th><th className="text-right">ECA A1 / cat. 3</th></tr></thead><tbody>
                {([['as', 'Arsénico', '0,01 / 0,1'], ['hg', 'Mercurio', '0,001 / 0,001'], ['pb', 'Plomo', '0,01 / 0,05'], ['cd', 'Cadmio', '0,003 / 0,01']] as const).map(([el, nm, ref]) => n(`oefa_${el}_n`) ? <tr key={el}><td>{nm}</td><td className="text-right tabular-nums">{fmtInt(n(`oefa_${el}_n`))}</td><td className={`text-right tabular-nums ${(n(`oefa_${el}_pct_a1`) ?? 0) > 25 ? 'text-mina font-medium' : ''}`}>{pct(n(`oefa_${el}_pct_a1`))}</td><td className="text-right tabular-nums">{pct(n(`oefa_${el}_pct_cat3`))}</td><td className="text-right tabular-nums">{fmt(n(`oefa_${el}_max`), 4)}</td><td className="text-right text-ink2">{ref}</td></tr> : null)}
              </tbody></Tabla>
              <p className="mt-2 text-xs text-ink2">Muestras de supervisión y evaluación ambiental de OEFA en cuerpos de agua superficial (ríos, quebradas, lagunas), no de agua de consumo. Muestreo dirigido a zonas con actividad fiscalizada: un % alto indica problema en los puntos medidos, no en todo el distrito. ECA Agua DS 004-2017-MINAM: A1 = potabilizable con desinfección; cat. 3 = riego y bebida de animales.</p>
            </> : <p className="mt-2 text-sm text-ink2">OEFA no tiene análisis de metales en agua superficial georreferenciados en este distrito (2014–2026).</p>}
          </Panel>
          <Panel>
            <div className="flex items-baseline justify-between"><h3 className="font-medium">Mortalidad registrada (SINADEF, domicilio del fallecido)</h3>{d.def_total_19_25 ? <Evidencia n="A">{d.tasa_inestable ? 'población < 5 mil: tasas inestables' : 'tasas crudas 2019–2025'}</Evidencia> : <Evidencia n="D" />}</div>
            {d.def_total_19_25 ? <>
              <div className="mt-2 flex flex-wrap gap-x-8 gap-y-3">
                {[['tasa_total', 'total'], ['tasa_renal', 'insuficiencia renal'], ['tasa_hepatica', 'enf. hepática'], ['tasa_cancer', 'cáncer'], ['tasa_cancer_piel', 'cáncer de piel'], ['tasa_neuro', 'sist. nervioso'], ['tasa_perinatal_congenita', 'perinatal/congénita']].map(([k, l]) => <Kpi key={k} v={d.tasa_inestable ? fmtInt(n('def_' + k.slice(5))) : fmt(n(k))} l={d.tasa_inestable ? `defunciones ${l} 2019–25` : `${l} por 100 mil hab-año`} nota={!d.tasa_inestable && nac[k] != null ? `mediana nacional ${fmt(nac[k])}` : undefined} />)}
              </div>
              <div className="mt-3 text-sm text-ink2">Defunciones por año (todas las causas)</div>
              <ReactECharts option={opt} style={{ height: 160 }} opts={{ renderer: 'svg' }} />
              <p className="text-xs text-ink2">Intoxicaciones por metales (T56) como causa básica: {fmtInt(n('def_intox_metales') ?? 0)} en 2019–2025. En todo el país solo hay 4 en 2017–2026: el certificado de defunción no capta la exposición crónica. Tasas crudas, no estandarizadas por edad; el registro tiene subregistro variable.</p>
            </> : <p className="mt-2 text-sm text-ink2">Sin defunciones con domicilio en este distrito en SINADEF 2019–2025, o distrito no emparejado.</p>}
          </Panel>
          <Panel>
            <div className="flex items-baseline justify-between"><h3 className="font-medium">Aprendizajes: ENLA 2024, 4.º de primaria</h3>{d.enla_lec_sat != null ? <Evidencia n="A">cobertura {pct(d.enla_cob_est)} de estudiantes</Evidencia> : <Evidencia n="D" />}</div>
            {d.enla_lec_sat != null ? <div className="mt-2 flex flex-wrap gap-x-8 gap-y-3">
              <Kpi v={pct(d.enla_lec_sat)} l="lectura: nivel satisfactorio" nota={`mediana nacional ${pct(nac.enla_lec_sat)}`} />
              <Kpi v={pct(d.enla_lec_prev)} l="lectura: previo al inicio" />
              <Kpi v={pct(d.enla_mat_sat)} l="matemática: satisfactorio" nota={`mediana nacional ${pct(nac.enla_mat_sat)}`} />
              <Kpi v={pct(d.enla_mat_prev)} l="matemática: previo al inicio" />
              <Kpi v={pct(d.enla_cob_ie)} l="cobertura de colegios" />
            </div> : <p className="mt-2 text-sm text-ink2">UMC no publica resultado distrital (menos de 10 estudiantes o cobertura insuficiente).</p>}
            {(d.enla_cob_est ?? 100) < 80 && <p className="mt-2 text-xs text-mina">Cobertura de estudiantes menor al 80 %: el resultado puede no representar al distrito.</p>}
            <div className="mt-3 text-sm text-ink2">Serie distrital (misma escala según UMC) y otros indicadores</div>
            <Tabla className="mt-1"><thead><tr><th>Indicador</th><th className="text-right">2016</th><th className="text-right">2018</th><th className="text-right">2019</th><th className="text-right">2024</th><th className="text-right">2025</th></tr></thead><tbody>
              <tr><td>4.º prim. lectura satisfactorio</td><td className="text-right tabular-nums">{pct(n('ece16_4p_lec_sat'))}</td><td className="text-right tabular-nums">{pct(n('ece18_4p_lec_sat'))}</td><td className="text-right">—</td><td className="text-right tabular-nums">{pct(d.enla_lec_sat)}</td><td className="text-right">—</td></tr>
              <tr><td>4.º prim. matemática satisfactorio</td><td className="text-right tabular-nums">{pct(n('ece16_4p_mat_sat'))}</td><td className="text-right tabular-nums">{pct(n('ece18_4p_mat_sat'))}</td><td className="text-right">—</td><td className="text-right tabular-nums">{pct(d.enla_mat_sat)}</td><td className="text-right">—</td></tr>
              <tr><td>2.º sec. lectura satisfactorio</td><td className="text-right">—</td><td className="text-right">—</td><td className="text-right tabular-nums">{pct(n('ece19_2s_lec_sat'))}</td><td className="text-right text-ink3">no evaluado</td><td className="text-right">—</td></tr>
              <tr><td>2.º sec. matemática satisfactorio</td><td className="text-right">—</td><td className="text-right">—</td><td className="text-right tabular-nums">{pct(n('ece19_2s_mat_sat'))}</td><td className="text-right text-ink3">no evaluado</td><td className="text-right">—</td></tr>
              <tr><td>Deserción interanual primaria (2023→2024)</td><td className="text-right">—</td><td className="text-right">—</td><td className="text-right">—</td><td className="text-right tabular-nums">{pct(n('desercion_prim_23_24'))}</td><td className="text-right">—</td></tr>
              <tr><td>Atraso escolar primaria</td><td className="text-right">—</td><td className="text-right">—</td><td className="text-right">—</td><td className="text-right">—</td><td className="text-right tabular-nums">{pct(n('atraso_prim_2025'))}</td></tr>
            </tbody></Tabla>
            <p className="mt-1 text-xs text-ink2">UMC-MINEDU (ECE 2016, 2018, 2019; ENLA 2024) y ESCALE-SIAGIE. ENLA 2023 y 2025 fueron muestrales (sin distrito); 2.º de secundaria no se evaluó en 2024.</p>
          </Panel>
        </div>
        <aside className="space-y-4">
          <Mapa height="18rem" seleccion={d.ubigeo} zoomA={d.ubigeo} valor={u => u === d.ubigeo ? 1 : null} color={v => v == null ? null : CAT.agua} tooltip={(_, nm) => nm} />
          <Panel>
            <h3 className="font-medium mb-2">Lo que falta aquí</h3>
            <ul className="text-sm space-y-1.5">
              {!d.oefa_agua_n && <li><Evidencia n="D" /> Análisis de metales en agua superficial (OEFA no ha muestreado aquí; ANA no publica valores).</li>}
              <li><Evidencia n="D" /> Calidad del agua de consumo humano por sistema de abastecimiento (DIGESA/DIRESA: sin dato abierto).</li>
              <li><Evidencia n="D" /> Biomarcadores de exposición (plomo, mercurio o arsénico en sangre/orina): no hay serie pública por distrito.</li>
              <li><Evidencia n="D" /> Morbilidad ambulatoria por diagnóstico (HIS-MINSA) por distrito: pendiente de integrar.</li>
              <li><Evidencia n="D" /> Anemia y desnutrición infantil (SIEN): pendiente de integrar.</li>
              {!d.sed_n && <li><Evidencia n="D" /> Geoquímica de sedimentos: sin muestras de INGEMMET en el distrito.</li>}
              {d.enla_lec_sat == null && <li><Evidencia n="D" /> Resultado ENLA 2024 no publicado para el distrito.</li>}
            </ul>
          </Panel>
          <Panel>
            <h3 className="font-medium mb-1">Fuentes de este perfil</h3>
            <ul className="text-xs text-ink2 space-y-1">{[...new Set(VARS.map(v => v.fuente))].map(f => <li key={f}>{f}</li>)}<li>OEFA PIFA, SERNANP, OSINERGMIN (capas del Observatorio Ambiental Peruano)</li><li>SIAF-MEF Datos Abiertos (vía QHAWAY)</li></ul>
          </Panel>
          <Aviso>Este perfil describe al distrito, no a sus habitantes. Ninguna cifra aquí demuestra que la contaminación cause los resultados de salud o educación observados.</Aviso>
        </aside>
      </div>
    </div>
  )
}
