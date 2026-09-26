import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Escalera de evidencia: el dispositivo estructural central del observatorio. */
export type Nivel = 'A' | 'B' | 'C' | 'D'
export const NIVEL: Record<Nivel, { t: string; d: string; cls: string }> = {
  A: { t: 'Medido', d: 'Dato oficial medido en el territorio (laboratorio, registro administrativo censal).', cls: 'bg-agua/15 text-agua border-agua/40' },
  B: { t: 'Asociación estadística', d: 'Relación observada a nivel distrital con control parcial de confusores. No prueba causalidad.', cls: 'bg-edu/15 text-edu border-edu/40' },
  C: { t: 'Hipótesis', d: 'Mecanismo plausible según la literatura; los datos disponibles no permiten contrastarlo aquí.', cls: 'bg-salud/15 text-salud border-salud/40' },
  D: { t: 'Sin datos', d: 'No hay medición pública para este territorio o variable. Ausencia de dato ≠ ausencia de problema.', cls: 'bg-ink3/10 text-ink2 border-line' },
}
export function Evidencia({ n, children }: { n: Nivel; children?: ReactNode }) {
  return <span title={NIVEL[n].d} className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${NIVEL[n].cls}`}><span className="font-display text-sm leading-none">{n}</span>{children ?? NIVEL[n].t}</span>
}
export function Titulo({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return <div className="mb-6 max-w-3xl"><h1 className="text-3xl md:text-4xl font-medium leading-tight">{children}</h1>{sub && <p className="mt-2 text-ink2 leading-relaxed">{sub}</p>}</div>
}
export function Seccion({ titulo, children, aside }: { titulo: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return <section className="mt-10"><div className="flex flex-wrap items-baseline justify-between gap-2 mb-3"><h2 className="text-2xl font-medium">{titulo}</h2>{aside}</div>{children}</section>
}
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-line bg-surface p-4 ${className}`}>{children}</div>
}
export function Kpi({ v, l, nota }: { v: ReactNode; l: string; nota?: string }) {
  return <div className="min-w-[8rem]"><div className="font-display text-3xl leading-none">{v}</div><div className="mt-1 text-sm text-ink2">{l}</div>{nota && <div className="text-xs text-ink3">{nota}</div>}</div>
}
export function Aviso({ children, tipo = 'nota' }: { children: ReactNode; tipo?: 'nota' | 'alerta' }) {
  return <div role={tipo === 'alerta' ? 'alert' : undefined} className={`rounded-md border-l-4 px-3 py-2 text-sm ${tipo === 'alerta' ? 'border-mina bg-mina/10' : 'border-line bg-ground'}`}>{children}</div>
}
export function Cargando({ que = 'datos' }: { que?: string }) { return <p className="text-ink3 text-sm py-8">Cargando {que}…</p> }
export function Error({ msg }: { msg: string }) { return <Aviso tipo="alerta">No se pudo cargar: {msg}. Recarga la página o revisa la conexión.</Aviso> }
export function LinkDistrito({ ubigeo, children }: { ubigeo: string; children: ReactNode }) { return <Link className="underline decoration-line hover:decoration-ink" to={`/distrito/${ubigeo}`}>{children}</Link> }
export function Tabla({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`overflow-x-auto ${className}`}><table className="w-full text-sm [&_th]:text-left [&_th]:font-medium [&_th]:text-ink2 [&_th]:py-1.5 [&_td]:py-1.5 [&_td]:pr-3 [&_th]:pr-3 [&_tr]:border-b [&_tr]:border-line">{children}</table></div> }
export const pSig = (p?: number) => p == null ? '' : p < 0.001 ? 'p < 0,001' : `p = ${p.toLocaleString('es-PE', { maximumFractionDigits: 3 })}`
