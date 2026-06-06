import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, ExternalLink } from 'lucide-react';

const SEVERITY_CONFIG = {
  Critical: { icon: AlertOctagon, badgeClass: 'badge-critical',  textColor: 'text-[var(--c-red)]' },
  High:     { icon: AlertTriangle, badgeClass: 'badge-high',    textColor: 'text-[var(--c-yellow)]' },
  Medium:   { icon: ShieldCheck,  badgeClass: 'badge-medium',   textColor: 'text-[var(--c-cyan)]' },
};

function RecommendationCard({ rec, index }) {
  const cfg = SEVERITY_CONFIG[rec.severity] || SEVERITY_CONFIG.Medium;
  const Icon = cfg.icon;

  return (
    <div className="glass-panel p-3 flex gap-3 animate-slide-in hover:border-[var(--c-border-glow)] transition-colors"
      style={{ animationDelay: `${index * 60}ms` }}>
      <div className={`mt-0.5 flex-shrink-0 ${cfg.textColor}`}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-mono text-xs text-[var(--c-yellow)]">
            {rec.technique_id}
          </span>
          <span className="text-xs font-semibold text-[var(--c-text)] truncate">
            {rec.technique_name}
          </span>
          <span className={`ml-auto badge ${cfg.badgeClass} flex-shrink-0`}>
            {rec.severity}
          </span>
        </div>
        <p className="text-[10px] text-[var(--c-cyan-dim)] font-mono uppercase tracking-wider mb-1">
          {rec.tactic}
        </p>
        <p className="text-xs text-[var(--c-text-dim)] leading-relaxed">
          {rec.mitigation}
        </p>
        <p className="text-[10px] text-[var(--c-text-dim)] mt-1">
          Mitigation: <span className="text-[var(--c-purple)] font-mono">{rec.mitigation_id}</span>
        </p>
      </div>
    </div>
  );
}

const RecommendationsPanel = ({ recommendations }) => {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(recommendations, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artemis-recommendations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel p-4 flex flex-col h-full">
      <div className="panel-header">
        <ShieldCheck size={16} className="text-[var(--c-green)]" />
        <h3 className="font-semibold text-sm text-[var(--c-green)]">
          MITRE ATT&amp;CK Recommendations
        </h3>
        {recommendations.length > 0 && (
          <button
            onClick={handleExport}
            className="ml-auto btn-ghost text-xs py-1 px-2"
            title="Export recommendations as JSON"
          >
            <ExternalLink size={11} />
            Export
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {recommendations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-[var(--c-text-dim)] py-8">
            <ShieldCheck size={28} className="opacity-20" />
            <p className="text-xs italic text-center">
              Recommendations appear after<br />successful attack steps.
            </p>
          </div>
        ) : (
          recommendations.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} index={i} />
          ))
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-3 pt-2 border-t border-[var(--c-border)] flex gap-3 text-xs font-mono text-[var(--c-text-dim)]">
          <span className="text-[var(--c-red)]">■ {recommendations.filter(r => r.severity === 'Critical').length} Critical</span>
          <span className="text-[var(--c-yellow)]">■ {recommendations.filter(r => r.severity === 'High').length} High</span>
          <span className="text-[var(--c-cyan)]">■ {recommendations.filter(r => r.severity === 'Medium').length} Medium</span>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPanel;
