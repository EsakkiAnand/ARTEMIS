import React from 'react';
import { Cpu, RefreshCw, Zap } from 'lucide-react';
import TerminalLog from '../components/TerminalLog';
import MetricsChart from '../components/MetricsChart';
import ShapAnalysis from '../components/ShapAnalysis';
import AttackGraph from '../components/AttackGraph';
import RecommendationsPanel from '../components/RecommendationsPanel';
import EpisodeTimeline from '../components/EpisodeTimeline';
import { Play, Square, Server, Activity } from 'lucide-react';

function StatCard({ label, value, sub, color = 'var(--c-cyan)' }) {
  return (
    <div className="glass-panel p-3 flex flex-col gap-0.5">
      <p className="text-[10px] text-[var(--c-text-dim)] uppercase tracking-widest font-mono">{label}</p>
      <p className="text-2xl font-bold transition-all duration-500" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-[var(--c-text-dim)]">{sub}</p>}
    </div>
  );
}

const DashboardPage = ({ sim }) => {
  const {
    status, sandboxStatus, logs, metrics, shapData,
    attackGraph, plan, adaptivePlan, recommendations, episodeHistory,
    loading, startSim, stopSim
  } = sim;

  const totalReward = metrics.length > 0 ? metrics[metrics.length - 1].reward : 0;
  const totalSteps  = episodeHistory.length;
  const compromises = attackGraph?.active_nodes?.filter(n => n !== 'attacker').length || 0;
  const successRate = totalSteps > 0
    ? Math.round(episodeHistory.filter(h => h.success).length / totalSteps * 100)
    : 0;

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--c-text)]">Simulation Dashboard</h2>
          <p className="text-xs text-[var(--c-text-dim)] mt-0.5">Real-time autonomous red team monitoring</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 glass-panel px-3 py-1.5 flex-1 sm:flex-none">
            <Server size={12} className="text-[var(--c-text-dim)]" />
            <span className="text-xs text-[var(--c-text-dim)]">Sandbox:</span>
            <span className={`badge ${
              sandboxStatus === 'running' ? 'badge-running'
              : sandboxStatus === 'mock'  ? 'badge-mock'
              : 'badge-stopped'
            }`}>{sandboxStatus}</span>
          </div>

          {status === 'stopped' ? (
            <button id="start-simulation-btn" onClick={startSim} disabled={loading} className="btn-primary flex-1 sm:flex-none justify-center">
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />}
              Start Simulation
            </button>
          ) : (
            <button id="stop-simulation-btn" onClick={stopSim} disabled={loading} className="btn-danger flex-1 sm:flex-none justify-center">
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Square size={15} />}
              Stop
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <StatCard
          label="Simulation"
          value={status.toUpperCase()}
          color={status === 'running' ? 'var(--c-green)' : 'var(--c-red)'}
        />
        <StatCard
          label="Cumulative Reward"
          value={totalReward.toFixed(1)}
          sub="RL agent score"
          color="var(--c-cyan)"
        />
        <StatCard
          label="Total Steps"
          value={totalSteps}
          sub={`${successRate}% success rate`}
          color="var(--c-purple)"
        />
        <StatCard
          label="Nodes Compromised"
          value={compromises}
          sub={`of ${(attackGraph?.nodes?.length || 1) - 1} targets`}
          color="var(--c-yellow)"
        />
      </div>

      {/* ── LLM Plan + Terminal ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* LLM Plan / Adaptive plan */}
        <div className="glass-panel p-4 max-h-52 overflow-y-auto">
          <div className="panel-header">
            <Cpu size={15} className="text-[var(--c-purple)]" />
            <h3 className="text-sm font-semibold text-[var(--c-purple)]">
              {adaptivePlan ? 'LLM Adaptive Re-plan' : 'LLM Attack Strategy'}
            </h3>
            {status === 'running' && (
              <span className="ml-auto flex items-center gap-1 text-[10px] text-[var(--c-green)] font-mono">
                <Activity size={10} className="animate-pulse" /> LIVE
              </span>
            )}
            {adaptivePlan && (
              <span className="ml-2 flex items-center gap-1 text-[10px] text-[var(--c-yellow)] font-mono">
                <Zap size={10} /> RE-PLAN
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--c-text)] font-mono leading-relaxed whitespace-pre-wrap">
            {adaptivePlan || plan || 'Loading strategy from LLM...'}
          </p>
        </div>

        {/* Terminal */}
        <TerminalLog logs={logs} />
      </div>

      {/* ── Attack Graph + Recommendations ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2">
          <AttackGraph graphData={attackGraph} />
        </div>
        <div className="lg:col-span-1 min-h-72">
          <RecommendationsPanel recommendations={recommendations} />
        </div>
      </div>

      {/* ── Metrics + SHAP ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <MetricsChart data={metrics} />
        <ShapAnalysis data={shapData} />
      </div>

      {/* ── Episode Timeline ─────────────────────────────────────────────── */}
      <EpisodeTimeline history={episodeHistory} />
    </div>
  );
};

export default DashboardPage;
