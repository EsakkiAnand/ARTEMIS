import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, Crosshair, FileText, Activity } from 'lucide-react';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scenarios', icon: Crosshair,       label: 'Scenarios'  },
  { to: '/report',    icon: FileText,        label: 'Report'     },
];

const Navbar = ({ status }) => (
  <aside className="w-[220px] min-h-screen flex flex-col bg-[var(--c-surface)] border-r border-[var(--c-border)] z-10 flex-shrink-0">
    {/* Logo */}
    <div className="px-5 py-5 border-b border-[var(--c-border)]">
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
    </div>

    {/* Status indicator */}
    <div className="px-5 py-3 border-b border-[var(--c-border)]">
      <div className="flex items-center gap-2">
        <Activity size={13} className={status === 'running' ? 'text-[var(--c-green)]' : 'text-[var(--c-text-dim)]'} />
        <span className="text-xs text-[var(--c-text-dim)]">Simulation</span>
        <span className={`ml-auto badge ${status === 'running' ? 'badge-running' : 'badge-stopped'}`}>
          {status}
        </span>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
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
);

export default Navbar;
