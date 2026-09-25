import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Cargando } from './components/ui'
const Panorama = lazy(() => import('./pages/Panorama'))
const Explorador = lazy(() => import('./pages/Explorador'))
const Relaciones = lazy(() => import('./pages/Relaciones'))
const Salud = lazy(() => import('./pages/Salud'))
const Agua = lazy(() => import('./pages/Agua'))
const Brechas = lazy(() => import('./pages/Brechas'))
const Casos = lazy(() => import('./pages/Casos'))
const Metodologia = lazy(() => import('./pages/Metodologia'))

const NAV = [
  ['/', 'Panorama'], ['/distrito', 'Explorador territorial'], ['/relaciones', 'Relaciones'], ['/salud', 'Salud'],
  ['/agua', 'Agua segura'], ['/brechas', 'Brechas de información'], ['/casos', 'Estudios de caso'], ['/metodologia', 'Metodología y datos'],
] as const

function ScrollTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0) }, [pathname]); return null }

export default function App() {
  return (
    <HashRouter>
      <ScrollTop />
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-2">Ir al contenido</a>
      <header className="border-b border-line bg-surface/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 flex flex-wrap items-center gap-x-6 gap-y-2 py-2">
          <NavLink to="/" className="flex items-center gap-2 mr-auto">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="rgb(var(--agua))" strokeWidth="2"/><circle cx="16" cy="16" r="8.5" fill="none" stroke="rgb(var(--mina))" strokeWidth="2"/><circle cx="16" cy="16" r="3" fill="rgb(var(--edu))"/></svg>
            <span className="font-display text-xl leading-none">Observatorio <span className="text-ink2">Perú</span></span>
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
        </Routes>
        </Suspense>
      </main>
      <footer className="border-t border-line mt-12 py-8 text-sm text-ink2">
        <div className="mx-auto max-w-7xl px-4 grid gap-4 md:grid-cols-3">
          <p>Observatorio Perú integra datos oficiales (INGEMMET, MINEM, OEFA, MINSA-SINADEF, UMC-MINEDU, INEI, PNUD) a nivel distrital. No afirma causalidad: muestra evidencia, hipótesis y vacíos.</p>
          <p>Código y datos procesados: <a className="underline" href="https://github.com/unimauro/observatorio-peru">github.com/unimauro/observatorio-peru</a>. Datos procesados bajo CC BY 4.0; cada fuente conserva su licencia.</p>
          <p>Proyecto de Carlos Cárdenas (<a className="underline" href="https://github.com/unimauro">unimauro</a>). Parte del ecosistema de observatorios ciudadanos: mortalidad, educación, ambiente, presupuesto (QHAWAY, FIEECS-UNI).</p>
        </div>
      </footer>
    </HashRouter>
  )
}
