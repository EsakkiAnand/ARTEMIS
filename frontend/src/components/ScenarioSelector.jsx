import React from 'react';
import { Crosshair, Shield, Zap, Target, ChevronRight, CheckCircle } from 'lucide-react';

const DIFFICULTY_CONFIG = {
  Easy:   { color: 'text-[var(--c-green)]',  bg: 'bg-[rgba(61,220,132,0.1)]',  border: 'border-[rgba(61,220,132,0.3)]' },
  Medium: { color: 'text-[var(--c-yellow)]', bg: 'bg-[rgba(255,209,102,0.1)]', border: 'border-[rgba(255,209,102,0.3)]' },
  Hard:   { color: 'text-[var(--c-red)]',    bg: 'bg-[rgba(255,77,106,0.1)]',  border: 'border-[rgba(255,77,106,0.3)]' },
};

const SCENARIO_ICONS = {
  web_full:    Target,
  ftp_brute:   Zap,
  ssh_lateral: Shield,
  recon_only:  Crosshair,
};

function ScenarioCard({ scenario, isActive, onSelect }) {
  const diff = DIFFICULTY_CONFIG[scenario.difficulty] || DIFFICULTY_CONFIG.Medium;
  const Icon = SCENARIO_ICONS[scenario.id] || Target;

  return (
    <div
      onClick={() => onSelect(scenario.id)}
      className={`glass-panel p-4 cursor-pointer transition-all duration-200 relative overflow-hidden ${
        isActive
          ? 'border-[var(--c-cyan-dim)] shadow-[0_0_20px_rgba(99,210,201,0.2)]'
          : 'hover:border-[var(--c-border-glow)]'
      }`}
    >
      {isActive && (
        <div className="absolute top-3 right-3">
          <CheckCircle size={15} className="text-[var(--c-cyan)]" />
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-[rgba(99,210,201,0.15)]' : 'bg-[rgba(255,255,255,0.04)]'}`}>
          <Icon size={18} className={isActive ? 'text-[var(--c-cyan)]' : 'text-[var(--c-text-dim)]'} />
        </div>
        <div>
          <h4 className={`font-semibold text-sm ${isActive ? 'text-[var(--c-cyan)]' : 'text-[var(--c-text)]'}`}>
            {scenario.name}
          </h4>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${diff.bg} ${diff.color} border ${diff.border}`}>
            {scenario.difficulty}
          </span>
        </div>
      </div>

      <p className="text-xs text-[var(--c-text-dim)] leading-relaxed mb-3">
        {scenario.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {scenario.tactics?.map(t => (
          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(99,210,201,0.06)] text-[var(--c-cyan-dim)] border border-[var(--c-border)] font-mono">
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--c-text-dim)]">
        <span>~{scenario.estimated_steps} steps</span>
        <div className="flex items-center gap-1 text-[var(--c-cyan-dim)]">
          Ports: {scenario.target_ports?.join(', ')}
        </div>
        <ChevronRight size={12} className={isActive ? 'text-[var(--c-cyan)]' : 'text-[var(--c-text-dim)]'} />
      </div>
    </div>
  );
}

const ScenarioSelector = ({ scenarios, activeScenario, onSelect, isRunning }) => (
  <div className="flex flex-col gap-4">
    <div className="panel-header">
      <Crosshair size={16} className="text-[var(--c-cyan)]" />
      <h3 className="font-semibold text-sm text-[var(--c-cyan)] neon-text-sm">
        Attack Scenarios
      </h3>
      {isRunning && (
        <span className="ml-auto text-xs text-[var(--c-yellow)] font-mono">
          Stop simulation to switch scenario
        </span>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {scenarios.map(s => (
        <ScenarioCard
          key={s.id}
          scenario={s}
          isActive={s.id === activeScenario}
          onSelect={isRunning ? () => {} : onSelect}
        />
      ))}
    </div>
  </div>
);

export default ScenarioSelector;
