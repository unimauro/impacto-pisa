import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Feature } from 'geojson'
import { useGeo } from '../lib/data'
import { Cargando } from './ui'

export interface MapaProps {
  valor: (ubigeo: string) => number | null
  color: (v: number | null) => string | null
  tooltip: (ubigeo: string, nombre: string) => string
  onClick?: (ubigeo: string) => void
  seleccion?: string | null
  height?: string
  puntos?: { lon: number; lat: number; color: string; r?: number; tip?: string }[]
  fit?: [number, number][]
  zoomA?: string | null
}
const SIN = { fillColor: '#ffffff', fillOpacity: 0.35, color: '#b9c1bd', weight: 0.4 }

const PERU: [number, number][] = [[-18.4, -81.4], [-0.03, -68.6]]
function Fit({ b, zoomA, geo }: { b?: [number, number][]; zoomA?: string | null; geo: GeoJSON.FeatureCollection }) {
  const m = useMap()
  useEffect(() => {
    if (zoomA) { const f = geo.features.find(x => x.properties?.IDDIST === zoomA); if (f) { m.fitBounds(L.geoJSON(f).getBounds().pad(1.2)); return } }
    m.fitBounds(L.latLngBounds(b ?? PERU), { padding: [10, 10] })
  }, [b, m, zoomA, geo])
  return null
}

export default function Mapa({ valor, color, tooltip, onClick, seleccion, height = '70vh', puntos, fit, zoomA }: MapaProps) {
  const { data: geo } = useGeo()
  const ref = useRef<L.GeoJSON>(null)
  const style = useMemo(() => (f?: Feature) => {
    const u = f?.properties?.IDDIST as string; const c = color(valor(u))
    const sel = seleccion === u
    return c ? { fillColor: c, fillOpacity: 0.9, color: sel ? '#111' : 'rgba(30,40,45,0.35)', weight: sel ? 2 : 0.4 } : { ...SIN, color: sel ? '#111' : SIN.color, weight: sel ? 2 : 0.4 }
  }, [valor, color, seleccion])
  useEffect(() => { ref.current?.setStyle(style) }, [style])
  const dataKey = useMemo(() => Math.random().toString(36).slice(2), [geo])
  if (!geo) return <div style={{ height }} className="flex items-center justify-center rounded-lg border border-line bg-surface"><Cargando que="mapa distrital (0,8 MB)" /></div>
  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-line relative">
      <MapContainer center={[-9.4, -75.2]} zoom={5} minZoom={4} maxZoom={12} preferCanvas scrollWheelZoom={false} className="h-full w-full" attributionControl={false}>
        <div className="leaflet-bottom leaflet-right"><div className="leaflet-control text-[10px] text-ink3 px-1">límites distritales INEI · sin mapa base</div></div>
        <GeoJSON key={dataKey} ref={ref} data={geo} style={style}
          onEachFeature={(f, layer) => {
            const u = f.properties.IDDIST as string; const nombre = `${f.properties.NOMBDIST}, ${f.properties.NOMBPROV} (${f.properties.NOMBDEP})`
            layer.bindTooltip(() => tooltip(u, nombre), { sticky: true, className: 'obs-tip', direction: 'top' })
            layer.on({ click: () => onClick?.(u), mouseover: e => e.target.setStyle({ weight: 1.5, color: '#111' }), mouseout: e => ref.current?.resetStyle(e.target) })
          }} />
        {puntos && <PuntosCanvas puntos={puntos} />}
        <Fit b={fit} zoomA={zoomA} geo={geo} />
      </MapContainer>
    </div>
  )
}

function PuntosCanvas({ puntos }: { puntos: NonNullable<MapaProps['puntos']> }) {
  const map = useMap()
  useEffect(() => {
    const renderer = L.canvas({ padding: 0.5 }); const g = L.layerGroup()
    for (const p of puntos) { const c = L.circleMarker([p.lat, p.lon], { renderer, radius: p.r ?? 3, color: p.color, weight: 1, fillColor: p.color, fillOpacity: 0.7, opacity: 0.9 }); if (p.tip) c.bindTooltip(p.tip, { className: 'obs-tip' }); g.addLayer(c) }
    g.addTo(map); return () => { g.remove() }
  }, [puntos, map])
  return null
}

export function Leyenda({ steps, breaks, unidad, fmt, titulo }: { steps: string[]; breaks: number[]; unidad: string; fmt: (v: number) => string; titulo?: string }) {
  return (
    <div className="text-xs">
      {titulo && <div className="mb-1 text-ink2">{titulo}</div>}
      <div className="flex items-stretch gap-0.5">
        {steps.map((c, i) => <div key={c} className="flex-1 min-w-[2.2rem]"><div className="h-3 rounded-sm" style={{ background: c }} /><div className="mt-0.5 text-ink2">{i === 0 ? `≤ ${fmt(breaks[0])}` : i === steps.length - 1 ? `> ${fmt(breaks[i - 1])}` : `${fmt(breaks[i - 1])}–${fmt(breaks[i])}`}</div></div>)}
        <div className="flex-1 min-w-[3rem]"><div className="h-3 rounded-sm border border-line bg-white/40" /><div className="mt-0.5 text-ink2">sin dato</div></div>
      </div>
      <div className="mt-1 text-ink3">{unidad}. Cortes por quintiles/sextiles de la distribución observada.</div>
    </div>
  )
}
