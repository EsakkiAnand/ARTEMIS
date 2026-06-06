import React from 'react';
import { Cpu } from 'lucide-react';

const FEATURE_COLORS = {
  is_scanned:      'var(--c-cyan)',
  ftp_compromised: 'var(--c-yellow)',
  ssh_compromised: 'var(--c-purple)',
  web_exploited:   'var(--c-cyan)',
  shell_obtained:  'var(--c-red)',
  privesc_done:    'var(--c-red)',
  lateral_moved:   'var(--c-green)',
  recon_depth:     'var(--c-text-dim)',
};

const FEATURE_NAMES = {
  is_scanned:      'Network Scan',
  ftp_compromised: 'FTP Breach',
  ssh_compromised: 'SSH Breach',
  web_exploited:   'Web Exploit',
  shell_obtained:  'Shell Access',
  privesc_done:    'Privilege Escalation',
  lateral_moved:   'Lateral Movement',
  recon_depth:     'Recon Depth',
};

const ShapAnalysis = ({ data }) => {
  const features = data
    ? Object.entries(data)
        .filter(([k]) => k !== 'mitre_labels')
        .sort(([, a], [, b]) => b - a)
    : [];

  const mitreLabels = data?.mitre_labels || {};

  return (
    <div className="glass-panel p-4 flex flex-col">
      <div className="panel-header">
        <Cpu size={14} className="text-[var(--c-purple)]" />
        <h3 className="text-sm font-semibold text-[var(--c-purple)]">
          SHAP Explainability — Feature Importance
        </h3>
      </div>

      {!data ? (
        <div className="flex-1 flex items-center justify-center min-h-[140px]">
          <p className="text-[var(--c-text-dim)] text-xs">Waiting for simulation data...</p>
        </div>
      ) : (
        <div className="space-y-2.5 mt-1">
          {features.map(([key, value]) => {
            const pct = Math.round(value * 100);
            const color = FEATURE_COLORS[key] || 'var(--c-cyan)';
            const mitre = mitreLabels[key];
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--c-text)]">{FEATURE_NAMES[key] || key}</span>
                    {mitre && (
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded"
                        style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
                        {mitre}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono font-bold" style={{ color }}>
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--c-surface-2)] overflow-hidden">
                  <div
                    className="h-full rounded-full animate-bar"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color}80, ${color})`,
                      boxShadow: `0 0 6px ${color}60`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShapAnalysis;
