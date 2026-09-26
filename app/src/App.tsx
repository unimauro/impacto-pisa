import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Cargando } from './components/ui'
import Chat from './components/Chat'
const Panorama = lazy(() => import('./pages/Panorama'))
const Explorador = lazy(() => import('./pages/Explorador'))
const Relaciones = lazy(() => import('./pages/Relaciones'))
const Salud = lazy(() => import('./pages/Salud'))
const Agua = lazy(() => import('./pages/Agua'))
const Brechas = lazy(() => import('./pages/Brechas'))
const Casos = lazy(() => import('./pages/Casos'))
const Metodologia = lazy(() => import('./pages/Metodologia'))
const Conclusiones = lazy(() => import('./pages/Conclusiones'))
const Faq = lazy(() => import('./pages/Faq'))
const Ecosistema = lazy(() => import('./pages/Ecosistema'))
const Pisa = lazy(() => import('./pages/Pisa'))

const NAV = [
  ['/', 'Inicio'], ['/pisa', 'El Perú en PISA'], ['/distrito', 'Explorador territorial'], ['/relaciones', 'Relaciones'], ['/salud', 'Salud'],
  ['/agua', 'Agua segura'], ['/brechas', 'Brechas'], ['/casos', 'Casos'], ['/conclusiones', 'Conclusiones'], ['/metodologia', 'Metodología'], ['/faq', 'FAQ'], ['/ecosistema', 'Ecosistema y apoyo'],
] as const
const TITULOS: Record<string, string> = { '/': 'Inicio', '/pisa': 'El Perú en PISA 2000–2025 y el mundo', '/distrito': 'Explorador territorial', '/relaciones': 'Relaciones ambiente, salud y educación', '/salud': 'Salud y contaminación', '/agua': 'Agua segura', '/brechas': 'Brechas de información', '/casos': 'Estudios de caso', '/conclusiones': 'Conclusiones', '/metodologia': 'Metodología, fuentes y descargas', '/faq': 'Preguntas frecuentes', '/ecosistema': 'Ecosistema, revisión de datos y apoyo' }

function ScrollTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); const k = '/' + pathname.split('/')[1]; (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'page_view', { page_path: '/impacto-pisa/#' + pathname, page_title: TITULOS[k] ?? 'Impacto PISA' }); document.title = k === '/' ? 'Impacto que PISA — El Perú en PISA y qué hay detrás, distrito por distrito' : `${TITULOS[k] ?? 'Impacto PISA'} — Impacto PISA · Observatorio Perú`; document.querySelector('link[rel=canonical]')?.setAttribute('href', 'https://unimauro.github.io/impacto-pisa/' + (pathname === '/' ? '' : '#' + pathname)) }, [pathname]); return null }

export default function App() {
  return (
    <HashRouter>
      <ScrollTop />
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-2">Ir al contenido</a>
      <header className="border-b border-line bg-surface/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 flex flex-wrap items-center gap-x-6 gap-y-2 py-2">
          <NavLink to="/" className="flex items-center gap-2 mr-auto">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} width="30" height="30" alt="" className="rounded-md" />
            <span className="leading-none"><span className="font-display text-xl">Impacto <span className="text-ink2">PISA</span></span><span className="hidden sm:block text-[11px] text-ink3 mt-0.5">impacto que pisa · Observatorio Perú</span></span>
          </NavLink>
          <nav aria-label="Secciones" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {NAV.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `py-1 border-b-2 ${isActive ? 'border-agua text-ink' : 'border-transparent text-ink2 hover:text-ink'}`}>{label}</NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="contenido" className="mx-auto max-w-7xl px-4 py-6">
        <Suspense fallback={<Cargando que="sección" />}>
        <Routes>
          <Route path="/" element={<Panorama />} />
          <Route path="/distrito" element={<Explorador />} />
          <Route path="/distrito/:ubigeo" element={<Explorador />} />
          <Route path="/relaciones" element={<Relaciones />} />
          <Route path="/salud" element={<Salud />} />
          <Route path="/agua" element={<Agua />} />
          <Route path="/brechas" element={<Brechas />} />
          <Route path="/casos" element={<Casos />} />
          <Route path="/casos/:id" element={<Casos />} />
          <Route path="/metodologia" element={<Metodologia />} />
          <Route path="/conclusiones" element={<Conclusiones />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/ecosistema" element={<Ecosistema />} />
          <Route path="/pisa" element={<Pisa />} />
        </Routes>
        </Suspense>
      </main>
      <Chat />
      <footer className="border-t border-line mt-12 py-8 text-sm text-ink2">
        <div className="mx-auto max-w-7xl px-4 grid gap-4 md:grid-cols-3">
          <p>Impacto PISA (Observatorio Perú) integra datos oficiales (INGEMMET, MINEM, OEFA, MINSA-SINADEF, UMC-MINEDU, INEI, PNUD) a nivel distrital. No afirma causalidad: muestra evidencia, hipótesis y vacíos.</p>
          <p>Código y datos procesados: <a className="underline" href="https://github.com/unimauro/impacto-pisa">github.com/unimauro/impacto-pisa</a>. Datos procesados bajo CC BY 4.0; cada fuente conserva su licencia.</p>
          <p>Proyecto de Carlos Cárdenas (<a className="underline" href="https://github.com/unimauro">unimauro</a>). Parte de una red de observatorios ciudadanos: <a className="underline" href="https://unimauro.github.io/observatorio-ambiental-peruano/">ambiental</a>, <a className="underline" href="https://unimauro.github.io/mortalidad-peru/">mortalidad</a>, <a className="underline" href="https://unimauro.github.io/educacion-peru/">educación</a>, <a className="underline" href="https://unimauro.github.io/qhaway-dashboard/">presupuesto (QHAWAY, FIEECS-UNI)</a>. <NavLink className="underline" to="/ecosistema">Apoya este trabajo</NavLink>.</p>
        </div>
      </footer>
    </HashRouter>
  )
}
