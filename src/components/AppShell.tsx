import { useState } from 'react'
import {
  BookOpen,
  ClipboardList,
  FileText,
  Home,
  FolderOpen,
  Mail,
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
  { to: '/exam', label: 'Question sets', icon: FileText },
  { to: '/materials', label: 'PDF materials', icon: FolderOpen },
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
        <a className="local-note" href="mailto:zjiaqi1214@gmail.com"><Mail aria-hidden="true" size={21} strokeWidth={1.6} /><span>Contact Jackie Zou</span></a>
      </aside>
      {menuOpen ? <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} /> : null}
      <main id="main-content" className="main-content" tabIndex={-1}>
        <Outlet />
        <footer className="site-footer">
          <strong>Created by Jackie Zou</strong>
          <span>Questions, corrections, or site issues are welcome.</span>
          <div className="site-footer-links"><a href="mailto:zjiaqi1214@gmail.com">Email</a><a href="https://www.linkedin.com/in/jackie-zou-652084382/" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://github.com/CadenzaMyFavourite/CO250-online-study/issues" target="_blank" rel="noreferrer">GitHub Issues</a></div>
        </footer>
      </main>
    </div>
  )
}
