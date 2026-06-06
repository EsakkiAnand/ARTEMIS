import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel p-2 text-[11px] font-mono">
      <p className="text-[var(--c-text-dim)]">Step {label}</p>
      <p className="text-[var(--c-cyan)]">Reward: <span className="font-bold">{payload[0]?.value?.toFixed(1)}</span></p>
    </div>
  );
};

const MetricsChart = ({ data = [] }) => {
  const latest = data.length > 0 ? data[data.length - 1].reward : 0;
  const maxReward = Math.max(...data.map(d => d.reward), 1);
  const trend = data.length > 2
    ? (data[data.length - 1].reward - data[data.length - 2].reward)
    : 0;

  return (
    <div className="glass-panel p-4 flex flex-col">
      <div className="panel-header">
        <TrendingUp size={14} className="text-[var(--c-cyan)]" />
        <h3 className="text-sm font-semibold text-[var(--c-cyan)]">
          RL Agent Performance — Cumulative Reward
        </h3>
        <span className="ml-auto text-xs text-[var(--c-text-dim)] font-mono">
          {latest.toFixed(1)} pts
          {trend !== 0 && (
            <span className={`ml-2 ${trend > 0 ? 'text-[var(--c-green)]' : 'text-[var(--c-red)]'}`}>
              {trend > 0 ? '▲' : '▼'}{Math.abs(trend).toFixed(1)}
            </span>
          )}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[140px]">
          <p className="text-[var(--c-text-dim)] text-xs">No metrics yet — start a simulation</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,210,201,0.08)" />
            <XAxis
              dataKey="step"
              tick={{ fill: 'var(--c-text-dim)', fontSize: 10, fontFamily: 'Space Mono' }}
              axisLine={{ stroke: 'var(--c-border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--c-text-dim)', fontSize: 10, fontFamily: 'Space Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="rgba(255,77,106,0.3)" strokeDasharray="4 2" />
            <Line
              type="monotone"
              dataKey="reward"
              stroke="var(--c-cyan)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--c-cyan)', strokeWidth: 0 }}
              style={{ filter: 'drop-shadow(0 0 4px var(--c-cyan))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MetricsChart;
