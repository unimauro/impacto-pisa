import { useEffect, useState } from 'react'
import type { Distrito, Analisis, Resumen, PuntoSed, PuntoPam, PuntoAgua, Fuente } from './types'
const BASE = import.meta.env.BASE_URL + 'data/'
const cache = new Map<string, Promise<unknown>>()
export function load<T>(name: string): Promise<T> {
  if (!cache.has(name)) cache.set(name, fetch(BASE + name).then(r => { if (!r.ok) throw new Error(`${name}: ${r.status}`); return r.json() }))
  return cache.get(name) as Promise<T>
}
export function useData<T>(name: string) {
  const [d, setD] = useState<T | null>(null); const [err, setErr] = useState<string | null>(null)
  useEffect(() => { let on = true; load<T>(name).then(v => { if (on) setD(v) }).catch(e => { if (on) setErr(String(e)) }); return () => { on = false } }, [name])
  return { data: d, error: err }
}
export const useDistritos = () => useData<Distrito[]>('distritos.json')
export const useAnalisis = () => useData<Analisis>('analisis.json')
export const useResumen = () => useData<Resumen>('resumen.json')
export const useSedimentos = () => useData<{ campos: string[]; n: number; puntos: PuntoSed[] }>('puntos-sedimentos.json')
export const usePam = () => useData<{ campos: string[]; n: number; puntos: PuntoPam[] }>('puntos-pam.json')
export const useAguas = () => useData<PuntoAgua[]>('puntos-aguas.json')
export const useFuentes = () => useData<Fuente[]>('catalogo.json')
export const useGeo = () => useData<GeoJSON.FeatureCollection>('peru-distrital.geojson')

export const fmt = (v: number | null | undefined, d = 1) => v == null || Number.isNaN(v) ? '—' : v.toLocaleString('es-PE', { maximumFractionDigits: d, minimumFractionDigits: 0 })
export const fmtInt = (v: number | null | undefined) => v == null ? '—' : Math.round(v).toLocaleString('es-PE')
export const pct = (v: number | null | undefined) => v == null ? '—' : `${fmt(v, 1)} %`
export function quantiles(vals: number[], q: number[]) { const s = [...vals].sort((a, b) => a - b); return q.map(p => s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))]) }

export type Dominio = 'ambiente' | 'salud' | 'educacion' | 'socio'
export interface VarDef { id: string; label: string; corto: string; dominio: Dominio; unidad: string; fuente: string; nota: string; log?: boolean; get: (d: Distrito) => number | null }
const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
export const VARS: VarDef[] = [
  { id: 'sed_as_med', label: 'Arsénico en sedimentos de quebrada (mediana)', corto: 'As sedimentos', dominio: 'ambiente', unidad: 'ppm', fuente: 'INGEMMET, 2000–2018', nota: 'Contexto geoquímico de la cuenca (natural + antrópico). No mide agua de consumo. Solo distritos con ≥ 3 muestras.', log: true, get: d => (d.sed_as_n ?? 0) >= 3 ? n(d.sed_as_med) : null },
  { id: 'sed_as_pct_pel', label: 'Muestras con arsénico sobre 17 ppm (PEL)', corto: '% As > PEL', dominio: 'ambiente', unidad: '%', fuente: 'INGEMMET', nota: 'Referencia CCME PEL (sedimento de agua dulce, Canadá). Perú no tiene ECA para sedimentos.', get: d => (d.sed_as_n ?? 0) >= 3 ? n(d.sed_as_pct_pel) : null },
  { id: 'sed_hg_med', label: 'Mercurio en sedimentos de quebrada (mediana)', corto: 'Hg sedimentos', dominio: 'ambiente', unidad: 'ppb', fuente: 'INGEMMET, 2000–2018', nota: 'Muchas muestras bajo el límite de detección (sustituidas por LD/2).', log: true, get: d => (d.sed_hg_n ?? 0) >= 3 ? n(d.sed_hg_med) : null },
  { id: 'sed_pb_med', label: 'Plomo en sedimentos de quebrada (mediana)', corto: 'Pb sedimentos', dominio: 'ambiente', unidad: 'ppm', fuente: 'INGEMMET, 2000–2018', nota: 'Contexto geoquímico.', log: true, get: d => (d.sed_pb_n ?? 0) >= 3 ? n(d.sed_pb_med) : null },
  { id: 'sed_cd_med', label: 'Cadmio en sedimentos de quebrada (mediana)', corto: 'Cd sedimentos', dominio: 'ambiente', unidad: 'ppm', fuente: 'INGEMMET, 2000–2018', nota: 'Contexto geoquímico.', log: true, get: d => (d.sed_cd_n ?? 0) >= 3 ? n(d.sed_cd_med) : null },
  { id: 'reinfo_total', label: 'Registros REINFO (vigentes + suspendidos)', corto: 'REINFO', dominio: 'ambiente', unidad: 'registros', fuente: 'MINEM vía GEOCATMIN, 2025', nota: 'Minería en proceso de formalización. No equivale a minería ilegal.', log: true, get: d => d.reinfo_total || null },
  { id: 'reinfo_por_10k', label: 'Registros REINFO por 10 mil habitantes', corto: 'REINFO por 10 mil hab.', dominio: 'ambiente', unidad: 'por 10 mil hab.', fuente: 'MINEM / INEI', nota: 'Intensidad relativa de la minería en formalización.', log: true, get: d => d.reinfo_total && d.pob ? d.reinfo_total / d.pob * 1e4 : null },
  { id: 'pam_n', label: 'Pasivos ambientales mineros', corto: 'Pasivos mineros', dominio: 'ambiente', unidad: 'pasivos', fuente: 'MINEM Inventario PAM', nota: 'Labores, residuos e infraestructura minera abandonadas.', log: true, get: d => d.pam_n || null },
  { id: 'um_n', label: 'Unidades mineras formales', corto: 'Unidades mineras', dominio: 'ambiente', unidad: 'unidades', fuente: 'MINEM/OSINERGMIN', nota: 'Producción + exploración.', get: d => d.um_n || null },
  { id: 'pasivos_hc_n', label: 'Pasivos ambientales de hidrocarburos', corto: 'Pasivos de hidrocarburos', dominio: 'ambiente', unidad: 'pasivos', fuente: 'OEFA PIFA', nota: 'Inventario nacional comunicado al MINEM (concentrado en Piura).', log: true, get: d => d.pasivos_hc_n || null },
  { id: 'enla_lec_sat', label: 'ENLA 2024 lectura: alumnos en nivel satisfactorio (4.º primaria)', corto: 'Lectura satisfactorio', dominio: 'educacion', unidad: '%', fuente: 'UMC-MINEDU', nota: 'Censal; ver cobertura de estudiantes por distrito.', get: d => n(d.enla_lec_sat) },
  { id: 'enla_mat_sat', label: 'ENLA 2024 matemática: alumnos en nivel satisfactorio (4.º primaria)', corto: 'Matemática satisfactorio', dominio: 'educacion', unidad: '%', fuente: 'UMC-MINEDU', nota: 'Censal; ver cobertura.', get: d => n(d.enla_mat_sat) },
  { id: 'enla_lec_prev', label: 'ENLA 2024 lectura: alumnos previo al inicio', corto: 'Lectura previo al inicio', dominio: 'educacion', unidad: '%', fuente: 'UMC-MINEDU', nota: 'Nivel más bajo de logro.', get: d => n(d.enla_lec_prev) },
  { id: 'tasa_renal', label: 'Mortalidad por insuficiencia renal (N17–N19)', corto: 'Mortalidad renal', dominio: 'salud', unidad: 'por 100 mil hab-año', fuente: 'SINADEF 2019–2025', nota: 'Tasa cruda; distritos < 5 mil hab. son inestables (excluidos).', get: d => d.tasa_inestable ? null : n(d.tasa_renal) },
  { id: 'tasa_hepatica', label: 'Mortalidad por enfermedad hepática (K70–K77)', corto: 'Mortalidad hepática', dominio: 'salud', unidad: 'por 100 mil hab-año', fuente: 'SINADEF 2019–2025', nota: 'Tasa cruda.', get: d => d.tasa_inestable ? null : n(d.tasa_hepatica) },
  { id: 'tasa_cancer', label: 'Mortalidad por cáncer (C00–D09)', corto: 'Mortalidad por cáncer', dominio: 'salud', unidad: 'por 100 mil hab-año', fuente: 'SINADEF 2019–2025', nota: 'Tasa cruda, sin estandarizar por edad.', get: d => d.tasa_inestable ? null : n(d.tasa_cancer) },
  { id: 'tasa_cancer_piel', label: 'Mortalidad por cáncer de piel (C43–C44)', corto: 'Cáncer de piel', dominio: 'salud', unidad: 'por 100 mil hab-año', fuente: 'SINADEF 2019–2025', nota: 'La literatura asocia cáncer de piel con arsénico crónico; aquí solo mortalidad registrada.', get: d => d.tasa_inestable ? null : n(d.tasa_cancer_piel) },
  { id: 'tasa_total', label: 'Mortalidad total registrada', corto: 'Mortalidad total', dominio: 'salud', unidad: 'por 100 mil hab-año', fuente: 'SINADEF 2019–2025', nota: 'Refleja también el subregistro y la estructura de edad.', get: d => d.tasa_inestable ? null : n(d.tasa_total) },
  { id: 'pobreza', label: 'Pobreza monetaria', corto: 'Pobreza', dominio: 'socio', unidad: '%', fuente: 'INEI', nota: 'Mapa de pobreza distrital.', get: d => n(d.pobreza) },
  { id: 'idh', label: 'Índice de Desarrollo Humano 2019', corto: 'IDH', dominio: 'socio', unidad: 'x100', fuente: 'PNUD', nota: '', get: d => n(d.idh) },
  { id: 'agua_red', label: 'Viviendas con agua por red pública', corto: 'Agua de red', dominio: 'socio', unidad: '%', fuente: 'INEI Censo 2017', nota: 'Acceso, no calidad del agua.', get: d => n(d.agua_red) },
  { id: 'altitud', label: 'Altitud de la capital distrital', corto: 'Altitud', dominio: 'socio', unidad: 'm s. n. m.', fuente: 'INEI', nota: '', get: d => n(d.altitud) },
]
export const varById = (id: string) => VARS.find(v => v.id === id)!
export const DOMINIO_LABEL: Record<Dominio, string> = { ambiente: 'Ambiente y minería', salud: 'Salud', educacion: 'Educación', socio: 'Socioeconómico' }
