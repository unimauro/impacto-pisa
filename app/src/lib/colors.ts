/** Rampas secuenciales de un solo tono (claro → oscuro) por dominio; diverging verdigris ↔ óxido con gris neutro al centro. */
export const RAMPAS: Record<string, string[]> = {
  ambiente: ['#fbeee4', '#f3cfb4', '#e8a97f', '#d9814f', '#c25a1e', '#8a3c0f'],
  salud: ['#f4f4dc', '#e2e2a8', '#c9c874', '#aaa94a', '#8b8a1f', '#5d5c12'],
  educacion: ['#e9ebfb', '#c8cdf4', '#a3abea', '#7d88df', '#4c5bd4', '#2f3a9a'],
  socio: ['#eceff0', '#cfd5d8', '#aeb8bd', '#8b989f', '#65747c', '#3f4b52'],
  agua: ['#e3f3f1', '#b5e0dc', '#7fc8c2', '#45aaa2', '#0b9389', '#066560'],
}
export const DIVERGING = ['#0b9389', '#6fbdb6', '#c9dad8', '#d8d8d8', '#e6c3ad', '#d98a5c', '#c25a1e']
export const CAT = { agua: '#0b9389', mina: '#c25a1e', edu: '#4c5bd4', salud: '#8b8a1f' }
export const SIN_DATO = 'rgba(0,0,0,0)'
export function colorScale(steps: string[], breaks: number[]) {
  return (v: number | null) => { if (v == null) return null; let i = 0; while (i < breaks.length && v > breaks[i]) i++; return steps[Math.min(i, steps.length - 1)] }
}
