import React from 'react';
import { FileText, Download, BarChart2, Shield, Target, AlertTriangle } from 'lucide-react';
import RecommendationsPanel from '../components/RecommendationsPanel';
import EpisodeTimeline from '../components/EpisodeTimeline';
import MetricsChart from '../components/MetricsChart';
import ShapAnalysis from '../components/ShapAnalysis';

const SEV_COLOR = {
  Critical: 'var(--c-red)',
  High:     'var(--c-yellow)',
  Medium:   'var(--c-cyan)',
  Low:      'var(--c-text-dim)',
};

const ReportPage = ({ sim }) => {
  const { recommendations, episodeHistory, metrics, shapData, report } = sim;

  const summary = report?.summary || {
    total_steps: episodeHistory.length,
    successful_attacks: episodeHistory.filter(h => h.success).length,
    failed_attacks: episodeHistory.filter(h => !h.success).length,
    total_reward: metrics.length > 0 ? metrics[metrics.length - 1].reward : 0,
    success_rate: episodeHistory.length > 0
      ? (episodeHistory.filter(h => h.success).length / episodeHistory.length * 100).toFixed(1)
      : 0,
    severity_counts: { Critical: 0, High: 0, Medium: 0, Low: 0 }
  };

  const killChain = report?.kill_chain || [];

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(report || {
      summary, kill_chain: killChain, recommendations, raw_history: episodeHistory
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artemis-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--c-text)]">Session Report</h2>
          <p className="text-xs text-[var(--c-text-dim)] mt-0.5">
            Full simulation results, MITRE kill chain, and countermeasure recommendations
          </p>
        </div>
        <button onClick={handleExport} className="btn-ghost text-xs">
          <Download size={13} /> Export Full Report (JSON)
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Steps',   value: summary.total_steps,         color: 'var(--c-text)'   },
          { label: 'Successful',    value: summary.successful_attacks,   color: 'var(--c-green)'  },
          { label: 'Failed',        value: summary.failed_attacks,       color: 'var(--c-red)'    },
          { label: 'Success Rate',  value: `${summary.success_rate}%`,   color: 'var(--c-cyan)'   },
          { label: 'Total Reward',  value: Number(summary.total_reward || 0).toFixed(1), color: 'var(--c-purple)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-panel p-3 flex flex-col gap-0.5">
            <p className="text-[10px] text-[var(--c-text-dim)] uppercase tracking-widest font-mono">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Severity breakdown */}
      {Object.values(summary.severity_counts || {}).some(v => v > 0) && (
        <div className="glass-panel p-4">
          <div className="panel-header">
            <AlertTriangle size={14} className="text-[var(--c-yellow)]" />
            <h3 className="text-sm font-semibold text-[var(--c-yellow)]">Severity Breakdown</h3>
          </div>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(summary.severity_counts).map(([sev, count]) => (
              <div key={sev} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: SEV_COLOR[sev] }} />
                <span className="text-sm font-semibold" style={{ color: SEV_COLOR[sev] }}>{count}</span>
                <span className="text-xs text-[var(--c-text-dim)]">{sev}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kill Chain */}
      {killChain.length > 0 && (
        <div className="glass-panel p-4">
          <div className="panel-header">
            <Target size={14} className="text-[var(--c-red)]" />
            <h3 className="text-sm font-semibold text-[var(--c-red)]">Attack Kill Chain</h3>
            <span className="ml-auto text-[10px] text-[var(--c-text-dim)] font-mono">{killChain.length} stages</span>
          </div>
          <div className="space-y-2">
            {killChain.map((stage, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-[var(--c-surface-2)] hover:bg-[rgba(99,210,201,0.04)] transition-colors">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ background: `${SEV_COLOR[stage.severity] || 'var(--c-cyan)'}20`, color: SEV_COLOR[stage.severity] }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-semibold text-[var(--c-text)]">{stage.tactic}</span>
                    <span className="badge" style={{
                      background: `${SEV_COLOR[stage.severity]}18`,
                      color: SEV_COLOR[stage.severity],
                      border: `1px solid ${SEV_COLOR[stage.severity]}40`
                    }}>{stage.technique}</span>
                    <span className="text-[10px] text-[var(--c-text-dim)]">{stage.severity}</span>
                  </div>
                  <p className="text-[11px] text-[var(--c-text-dim)] mt-0.5 truncate">{stage.action}</p>
                  <p className="text-[10px] text-[var(--c-cyan)] mt-0.5">{stage.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <EpisodeTimeline history={episodeHistory} />

      {/* Metrics + SHAP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricsChart data={metrics} />
        <ShapAnalysis data={shapData} />
      </div>

      {/* MITRE Recommendations */}
      <div className="min-h-[320px]">
        <RecommendationsPanel recommendations={recommendations} />
      </div>

      {!summary.total_steps && (
        <div className="glass-panel p-8 flex flex-col items-center justify-center gap-3 text-center">
          <FileText size={32} className="text-[var(--c-text-dim)]" />
          <p className="text-[var(--c-text-dim)] text-sm">No session data yet.</p>
          <p className="text-[var(--c-text-dim)] text-xs">
            Run a simulation on the Dashboard page, then stop it to generate the report.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
