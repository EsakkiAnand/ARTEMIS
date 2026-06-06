import React from 'react';
import { Clock, CheckCircle, XCircle, Minus } from 'lucide-react';

const EpisodeTimeline = ({ history = [] }) => {
  if (history.length === 0) {
    return (
      <div className="glass-panel p-4">
        <div className="panel-header">
          <Clock size={14} className="text-[var(--c-yellow)]" />
          <h3 className="text-sm font-semibold text-[var(--c-yellow)]">Episode Timeline</h3>
          <span className="ml-auto text-[10px] text-[var(--c-text-dim)] font-mono">0 steps</span>
        </div>
        <div className="flex items-center justify-center h-16 text-[var(--c-text-dim)] text-xs gap-2">
          <Clock size={14} />
          No episode data yet. Start a simulation.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4">
      <div className="panel-header">
        <Clock size={14} className="text-[var(--c-yellow)]" />
        <h3 className="text-sm font-semibold text-[var(--c-yellow)]">Episode Timeline</h3>
        <span className="ml-auto text-[10px] text-[var(--c-text-dim)] font-mono">
          {history.length} steps &nbsp;·&nbsp;
          {history.filter(h => h.success).length} success &nbsp;·&nbsp;
          {history.filter(h => !h.success).length} fail
        </span>
      </div>

      {/* Horizontal scrollable timeline */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-0 min-w-max">
          {history.map((step, i) => {
            const sev = step.mitre?.severity || 'Medium';
            const sevColor = {
              Critical: 'var(--c-red)',
              High:     'var(--c-yellow)',
              Medium:   'var(--c-cyan)',
              Low:      'var(--c-text-dim)',
            }[sev] || 'var(--c-cyan)';

            return (
              <React.Fragment key={i}>
                {/* Node */}
                <div className="flex flex-col items-center group relative">
                  {/* Step circle */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer"
                    style={{
                      borderColor: step.success ? sevColor : 'var(--c-text-dim)',
                      background: step.success ? `${sevColor}18` : 'transparent',
                      boxShadow: step.success ? `0 0 8px ${sevColor}50` : 'none',
                    }}
                    title={step.message}
                  >
                    {step.success
                      ? <CheckCircle size={14} style={{ color: sevColor }} />
                      : <XCircle size={14} className="text-[var(--c-text-dim)]" />
                    }
                  </div>

                  {/* Step number */}
                  <span className="text-[9px] font-mono text-[var(--c-text-dim)] mt-1">
                    S{step.step || i + 1}
                  </span>

                  {/* MITRE badge */}
                  {step.mitre?.technique_id && (
                    <span
                      className="text-[8px] font-mono px-1 mt-0.5 rounded"
                      style={{ color: sevColor, background: `${sevColor}15` }}
                    >
                      {step.mitre.technique_id}
                    </span>
                  )}

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52 bg-[var(--c-surface-2)] border border-[var(--c-border)] rounded-lg p-2 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    <p className="text-[var(--c-text)] mb-1 break-words">{step.message}</p>
                    <p className="text-[var(--c-text-dim)]">
                      Reward: <span style={{ color: step.reward > 0 ? 'var(--c-green)' : 'var(--c-red)' }}>
                        {step.reward > 0 ? '+' : ''}{step.reward}
                      </span>
                    </p>
                    {step.confidence !== undefined && (
                      <p className="text-[var(--c-text-dim)]">
                        Confidence: {(step.confidence * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                {i < history.length - 1 && (
                  <div
                    className="h-0.5 w-6 flex-shrink-0"
                    style={{
                      background: step.success
                        ? `linear-gradient(90deg, ${sevColor}60, var(--c-border))`
                        : 'var(--c-border)',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Reward summary bar */}
      <div className="mt-3 flex gap-4 flex-wrap">
        {['Critical', 'High', 'Medium'].map(sev => {
          const count = history.filter(h => h.success && h.mitre?.severity === sev).length;
          const color = { Critical: 'var(--c-red)', High: 'var(--c-yellow)', Medium: 'var(--c-cyan)' }[sev];
          if (!count) return null;
          return (
            <span key={sev} className="text-[10px] flex items-center gap-1 font-mono"
              style={{ color }}>
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              {sev}: {count}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default EpisodeTimeline;
