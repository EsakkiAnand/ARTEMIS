import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, Crosshair, FileText, Activity, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scenarios', icon: Crosshair,       label: 'Scenarios'  },
  { to: '/report',    icon: FileText,        label: 'Report'     },
];

/* ── Shared nav link builder ── */
function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      key={to}
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-[rgba(99,210,201,0.12)] text-[var(--c-cyan)] border border-[var(--c-border-glow)]'
            : 'text-[var(--c-text-dim)] hover:text-[var(--c-text)] hover:bg-[rgba(255,255,255,0.04)]'
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );
}

/* ── Logo block ── */
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <ShieldAlert size={28} className="text-[var(--c-cyan)] animate-flicker" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--c-cyan)] animate-pulse-dot" />
      </div>
      <div>
        <h1 className="text-lg font-bold tracking-[0.18em] neon-text">ARTEMIS</h1>
        <p className="text-[9px] text-[var(--c-text-dim)] tracking-widest uppercase">Red Team AI</p>
      </div>
    </div>
  );
}

/* ── Status chip ── */
function StatusChip({ status }) {
  return (
    <div className="flex items-center gap-2">
      <Activity
        size={13}
        className={status === 'running' ? 'text-[var(--c-green)]' : 'text-[var(--c-text-dim)]'}
      />
      <span className="text-xs text-[var(--c-text-dim)]">Simulation</span>
      <span className={`ml-auto badge ${status === 'running' ? 'badge-running' : 'badge-stopped'}`}>
        {status}
      </span>
    </div>
  );
}

const Navbar = ({ status }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* ══════════════════════════════════════════════
          DESKTOP SIDEBAR  (hidden on mobile)
      ══════════════════════════════════════════════ */}
      <aside className="hidden md:flex w-[220px] min-h-screen flex-col bg-[var(--c-surface)] border-r border-[var(--c-border)] z-20 flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[var(--c-border)]">
          <Logo />
        </div>

        {/* Status */}
        <div className="px-5 py-3 border-b border-[var(--c-border)]">
          <StatusChip status={status} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--c-border)]">
          <p className="text-[10px] text-[var(--c-text-dim)] leading-relaxed">
            v1.0.0 — Safe simulation only.<br />
            All attacks run in isolated sandbox.
          </p>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          MOBILE TOP BAR  (visible on mobile only)
      ══════════════════════════════════════════════ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-[var(--c-surface)] border-b border-[var(--c-border)] backdrop-blur-sm">
        <Logo />
        <div className="flex items-center gap-3">
          <span className={`badge ${status === 'running' ? 'badge-running' : 'badge-stopped'}`}>
            {status}
          </span>
          <button
            id="mobile-menu-toggle"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-[var(--c-text-dim)] hover:text-[var(--c-cyan)] hover:bg-[rgba(99,210,201,0.08)] transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          MOBILE DRAWER OVERLAY
      ══════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col bg-[var(--c-surface)] border-r border-[var(--c-border)] shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--c-border)]">
          <Logo />
          <button
            id="mobile-menu-close"
            onClick={closeDrawer}
            className="p-2 rounded-lg text-[var(--c-text-dim)] hover:text-[var(--c-cyan)] hover:bg-[rgba(99,210,201,0.08)] transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status in drawer */}
        <div className="px-5 py-3 border-b border-[var(--c-border)]">
          <StatusChip status={status} />
        </div>

        {/* Nav links in drawer */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={closeDrawer} />
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-5 py-4 border-t border-[var(--c-border)]">
          <p className="text-[10px] text-[var(--c-text-dim)] leading-relaxed">
            v1.0.0 — Safe simulation only.<br />
            All attacks run in isolated sandbox.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MOBILE BOTTOM TAB BAR
      ══════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center bg-[var(--c-surface)] border-t border-[var(--c-border)] backdrop-blur-sm bottom-tab-safe">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-all duration-200 ${
                isActive
                  ? 'text-[var(--c-cyan)]'
                  : 'text-[var(--c-text-dim)] hover:text-[var(--c-text)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-[rgba(99,210,201,0.15)]' : ''
                }`}>
                  <Icon size={18} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
