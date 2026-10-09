import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon/Icon';
import './workspace.css';

export function WorkspaceLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const section = pathname.startsWith('/projects') ? 'Projects' : 'Dashboard';
  return (
    <div className="workspace-shell">
      <a className="workspace-skip" href="#workspace-main">Skip to content</a>
      {menuOpen && <button className="workspace-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside id="workspace-sidebar" className={`workspace-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <Link to="/dashboard" className="workspace-brand" onClick={() => setMenuOpen(false)}>
          <span className="workspace-brand-mark"><Icon name="layers" /></span>
          <span>AI Office<span className="workspace-brand-caption">PRODUCTION WORKSPACE</span></span>
        </Link>
        <div className="workspace-switcher"><span className="workspace-avatar">S</span><div>Studio workspace<small>Personal workspace</small></div></div>
        <p className="workspace-nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}><Icon name="dashboard" />Dashboard</NavLink>
          <NavLink to="/projects" onClick={() => setMenuOpen(false)}><Icon name="folder" />Projects</NavLink>
        </nav>
        <div className="workspace-sidebar-note"><Icon name="document" /><p>From brief to storyboard.<span>Keep your production in one place.</span></p></div>
        <div className="workspace-profile"><span className="workspace-avatar">S</span><div>Studio member<small>Personal workspace</small></div><span className="workspace-profile-dot" /></div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <button className="workspace-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="workspace-sidebar" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
          <div className="workspace-breadcrumb">Workspace <span>/</span> <strong>{section}</strong></div>
          <span className="workspace-topbar-label">Creative production</span>
        </header>
        <main id="workspace-main" className="workspace-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
