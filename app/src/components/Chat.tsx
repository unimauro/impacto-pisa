import { useEffect, useRef, useState } from 'react'
import { useResumen, useData, fmtInt, fmt, pct } from '../lib/data'
import { FAQ } from '../pages/Faq'

const GATEWAY = 'https://ai.tunky.net/v1/chat'
const TOKEN = (import.meta.env.VITE_TUNKY_TOKEN as string | undefined) ?? ''
interface Msg { role: 'user' | 'assistant'; content: string }
interface Fact { resultados: { y: string; label: string; modelo_todos: { n: number; r2: number; coef: { label: string; beta: number; p: number }[] }; r2_socio: number; ganancia_ambiente: number }[] }
interface PisaMin { peru: { anio: number; matematica?: number | null; lectura?: number | null; ciencias?: number | null; matematica_bajo_nivel2?: number | null; lectura_bajo_nivel2?: number | null; ciencias_bajo_nivel2?: number | null }[] }
const SUGERIDAS = ['¿Por qué bajó el Perú en PISA 2025?', '¿La contaminación explica los malos resultados escolares?', '¿Dónde hay arsénico en el agua según OEFA?', '¿Qué datos faltan en el país?', '¿Qué pasa con Puerto Almendra y el arsénico?']

export default function Chat() {
  const [open, setOpen] = useState(false); const [msgs, setMsgs] = useState<Msg[]>([]); const [q, setQ] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null)
  const { data: res } = useResumen(); const { data: fac } = useData<Fact>('factores.json'); const { data: pisa } = useData<PisaMin>('pisa.json')
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => { box.current?.scrollTo({ top: 1e6 }) }, [msgs, busy])
  const system = () => {
    const ult = pisa?.peru[pisa.peru.length - 1]; const prev = pisa?.peru[pisa.peru.length - 2]; const fl = fac?.resultados.find(r => r.y === 'enla_lec_sat')
    return [
      'Eres el asistente de "Impacto PISA — Observatorio Perú" (https://unimauro.github.io/impacto-pisa/), un observatorio de datos abiertos que cruza aprendizajes (PISA nacional, ENLA distrital), pobreza, agua, minería y contaminación por distrito del Perú.',
      'REGLAS ESTRICTAS: (1) Responde SOLO con la información de este contexto y de las secciones del sitio; si algo no está aquí, di "el observatorio no tiene ese dato" y sugiere la sección Brechas o la fuente oficial. (2) NUNCA afirmes causalidad: las relaciones son asociaciones distritales (falacia ecológica). (3) No inventes cifras ni fuentes. (4) Distingue medido (A), asociación estadística (B), hipótesis (C) y sin datos (D). (5) Responde en español, breve (máximo 6 frases), y cita la sección del sitio (Inicio, El Perú en PISA, Explorador territorial, Relaciones, Salud, Agua segura, Brechas, Casos, Conclusiones, Metodología, FAQ). (6) Un cero en un inventario no es ausencia de problema; un distrito sin muestra no está limpio. (7) No des consejos médicos individuales.',
      ult && prev ? `PISA Perú ${ult.anio}: matemática ${fmt(ult.matematica, 0)} (${fmt((ult.matematica ?? 0) - (prev.matematica ?? 0), 0)} vs ${prev.anio}), lectura ${fmt(ult.lectura, 0)} (${fmt((ult.lectura ?? 0) - (prev.lectura ?? 0), 0)}), ciencias ${fmt(ult.ciencias, 0)} (${fmt((ult.ciencias ?? 0) - (prev.ciencias ?? 0), 0)}). Bajo nivel 2: mat ${pct(ult.matematica_bajo_nivel2)}, lec ${pct(ult.lectura_bajo_nivel2)}, cie ${pct(ult.ciencias_bajo_nivel2)}. Serie: ${pisa!.peru.map(r => `${r.anio}: ${fmt(r.matematica, 0)}/${fmt(r.lectura, 0)}/${fmt(r.ciencias, 0)}`).join('; ')} (mat/lec/cie). Promedio OCDE 2025: 463/461/482. Perú 2025 puesto 67 de 90 en matemática, 61 de 90 en lectura, 70 de 91 en ciencias. PISA es muestra nacional (no representativa por región ni distrito). Fuente: OCDE Vol. I y UMC-MINEDU.` : '',
      fl ? `Modelo multifactorial (Conclusiones): en lectura ENLA 2024 (4.º primaria, ${fmtInt(fl.modelo_todos.n)} distritos) las variables socioeconómicas explican R² = ${pct(fl.r2_socio * 100)}; añadir todas las ambientales suma ${fmt(fl.ganancia_ambiente * 100, 1)} puntos. Coeficientes mayores: ${fl.modelo_todos.coef.slice(0, 5).map(c => `${c.label} β=${fmt(c.beta, 2)}`).join(', ')}. Ninguna correlación parcial ambiente↔resultado supera |r|=0,2. Interpretación: los bajos resultados son multifactoriales y dominan pobreza, ruralidad, altitud y conectividad; la huella ambiental a escala distrital es pequeña y la exposición real (agua de consumo, biomarcadores) no está medida.` : '',
      res ? `Datos del observatorio: ${fmtInt(res.n_distritos)} distritos; INGEMMET ${fmtInt(res.sedimentos.n)} muestras de sedimento 2000–2018 (As, Hg, Pb, Cd), ${fmtInt(res.sedimentos.as_sobre_pel)} con As > 17 ppm (PEL); OEFA ${fmtInt(res.oefa_agua?.muestras)} análisis de metales en agua superficial 2014–2026 en ${fmtInt(res.oefa_agua?.distritos)} distritos (26,7 % de los de arsénico superan el ECA A1 de 0,01 mg/L; 8,7 % el de riego 0,1; plomo 18,8 %, cadmio 18 %, mercurio 1,6 % sobre A1; muestreo dirigido a zonas fiscalizadas); MINEM ${fmtInt(res.pam.n)} pasivos ambientales mineros y ${fmtInt(res.reinfo.n)} registros REINFO (${fmtInt(res.reinfo.vigente)} vigentes; REINFO no es minería ilegal); OEFA ${fmtInt(res.emergencias?.n)} emergencias ambientales 2011–2026, ${fmtInt(res.mineria_ilegal_ha)} ha de minería ilegal identificada; SINADEF ${fmtInt(res.sinadef.def_total)} defunciones 2019–2025 por distrito (solo 4 muertes por intoxicación por metales T56 en 2017–2026: el certificado no capta exposición crónica); ENLA 2024 en ${fmtInt(res.enla.n_distritos)} distritos; ECE 2016/2018 y 2019 (2.º sec.), deserción y atraso ESCALE. Sin dato abierto: agua de consumo humano (DIGESA/DIRESA), valores de ANA, biomarcadores por distrito, HIS-MINSA 2017+.` : '',
      'Casos: Puerto Almendra (Loreto, río Nanay): NO hay medición de arsénico; la evidencia regional (de Meyer 2023) indica que los pozos en riberas de ríos pobres en sedimento como el Nanay no superan 5 µg/L; el riesgo plausible es acidez/aluminio y mercurio en pescado (79 % de personas en comunidades del Nanay sobre 2,2 mg/kg en cabello, CINCIA 2024); el proyecto de planta debe empezar por caracterizar el agua. Nazca (Ica): 20 plantas de beneficio registradas y otras no registradas, operativos 2025–2026 por insumos y relaves con cianuro, anemia 19,4 % en niños atendidos; cero estudios de mercurio. Puno: arsénico geogénico en pozos 3–446 µg/L (Callacame) y 100 % de 28 puntos > 10 µg/L en Juliaca. Madre de Dios: 8 estudios de mercurio en cabello/orina desde 2010; 37 % sobre 2,2 µg/g en el corredor Interoceánico; aire hasta > 5 000 ng/m³ junto a tiendas de oro.',
      'FAQ: ' + FAQ.map(f => `P: ${f.q} R: ${f.a}`).join(' | '),
    ].filter(Boolean).join('\n\n')
  }
  async function enviar(texto: string) {
    const t = texto.trim(); if (!t || busy) return
    const next: Msg[] = [...msgs, { role: 'user', content: t }]; setMsgs(next); setQ(''); setBusy(true); setErr(null)
    try {
      const r = await fetch(GATEWAY, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(TOKEN ? { 'X-Client-Token': TOKEN } : {}) }, body: JSON.stringify({ project: 'impacto-pisa', messages: [{ role: 'system', content: system() }, ...next.slice(-8)] }) })
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || `HTTP ${r.status}`) }
      const { reply } = await r.json(); setMsgs([...next, { role: 'assistant', content: String(reply || '').trim() }])
    } catch (e) { setErr(String((e as Error).message)) } finally { setBusy(false) }
  }
  return (
    <>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="chat-panel" className="fixed bottom-4 right-4 z-50 rounded-full bg-agua text-white shadow-lg px-4 py-3 text-sm font-medium flex items-center gap-2 hover:brightness-110" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z" /></svg>{open ? 'Cerrar' : 'Pregúntale a los datos'}
      </button>
      {open && <section id="chat-panel" aria-label="Chat con los datos" className="fixed bottom-20 right-4 z-50 w-[min(26rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface shadow-xl flex flex-col max-h-[70vh]">
        <header className="px-3 py-2 border-b border-line"><div className="font-medium">Pregúntale a los datos</div><div className="text-xs text-ink2">Responde solo con lo que hay en el observatorio, con su nivel de evidencia. No afirma causalidad.</div></header>
        <div ref={box} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm">
          {msgs.length === 0 && <div className="flex flex-wrap gap-1.5">{SUGERIDAS.map(s => <button key={s} onClick={() => enviar(s)} className="rounded-full border border-line px-2.5 py-1 text-xs text-ink2 hover:bg-ground">{s}</button>)}</div>}
          {msgs.map((m, i) => <div key={i} className={`rounded-md px-3 py-2 whitespace-pre-wrap ${m.role === 'user' ? 'bg-agua/10 ml-8' : 'bg-ground mr-8'}`}>{m.content}</div>)}
          {busy && <div className="text-ink3 text-xs">Consultando…</div>}
          {err && <div role="alert" className="text-mina text-xs">No se pudo responder ({err}). {!TOKEN && 'El chat aún no tiene token de acceso al gateway.'} Puedes revisar la sección FAQ o Conclusiones.</div>}
        </div>
        <form className="flex gap-2 p-2 border-t border-line" onSubmit={e => { e.preventDefault(); enviar(q) }}>
          <input className="flex-1 rounded border border-line bg-surface px-2 py-1.5 text-sm" value={q} onChange={e => setQ(e.target.value)} placeholder="Escribe tu pregunta" aria-label="Pregunta" maxLength={500} />
          <button className="rounded bg-agua text-white px-3 text-sm disabled:opacity-50" disabled={busy || !q.trim()}>Enviar</button>
        </form>
        <div className="px-3 pb-2 text-[10px] text-ink3">IA vía ai.tunky.net (OpenRouter). Puede equivocarse: verifica en la sección citada. No se guardan tus preguntas en este sitio.</div>
      </section>}
    </>
  )
}
