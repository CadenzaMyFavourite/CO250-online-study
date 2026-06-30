import { useState } from 'react'
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  Home,
  Laptop,
  Map,
  Menu,
  PencilLine,
  Search,
  Sigma,
  X,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Seo } from './Seo'

const navigation = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/course-map', label: 'Course map', icon: Map },
  { to: '/library', label: 'Library', icon: BookOpen },
  { to: '/notation', label: 'Notation guide', icon: Sigma },
  { to: '/procedures', label: 'Procedures', icon: ClipboardList },
  { to: '/practice', label: 'Practice', icon: PencilLine },
  { to: '/exam', label: 'Exam builder', icon: FileText },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
]

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <Seo />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="mobile-header">
        <NavLink to="/" className="mobile-brand">CO 250 / FIELD GUIDE</NavLink>
        <button className="icon-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </header>
      <aside className={menuOpen ? 'sidebar sidebar--open' : 'sidebar'} aria-label="Main navigation">
        <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>CO 250 / FIELD GUIDE</NavLink>
        <nav>
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
            >
              <Icon aria-hidden="true" size={22} strokeWidth={1.7} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <NavLink className="sidebar-search" to="/library" onClick={() => setMenuOpen(false)}>
          <Search aria-hidden="true" size={18} />
          Search the field guide
          <kbd>/</kbd>
        </NavLink>
        <div className="local-note">
          <Laptop aria-hidden="true" size={21} strokeWidth={1.6} />
          <span>Stored on this device</span>
        </div>
      </aside>
      {menuOpen ? <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} /> : null}
      <main id="main-content" className="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
