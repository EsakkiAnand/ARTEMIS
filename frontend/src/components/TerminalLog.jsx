import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Filter } from 'lucide-react';

const LEVEL_STYLES = {
  success: { color: 'text-[var(--c-green)]',  prefix: '✓', badge: 'bg-green-950 text-[var(--c-green)]' },
  fail:    { color: 'text-[var(--c-red)]',    prefix: '✗', badge: 'bg-red-950 text-[var(--c-red)]' },
  warn:    { color: 'text-[var(--c-yellow)]', prefix: '⚠', badge: 'bg-yellow-950 text-[var(--c-yellow)]' },
  info:    { color: 'text-[var(--c-cyan)]',   prefix: '›', badge: 'bg-cyan-950 text-[var(--c-cyan)]' },
};

const TerminalLog = ({ logs = [] }) => {
  const bottomRef = useRef(null);
  const [filter, setFilter] = useState('all');

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  const filtered = filter === 'all'
    ? logs
    : logs.filter(l => l.level === filter || (filter === 'success' && l.success) || (filter === 'fail' && !l.success));

  return (
    <div className="glass-panel p-4 flex flex-col h-64">
      {/* Header */}
      <div className="panel-header flex items-center">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--c-red)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--c-yellow)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--c-green)]" />
        </div>
        <span className="ml-3 text-xs font-mono text-[var(--c-cyan)] tracking-widest flex items-center gap-1">
          <Terminal size={12} /> ARTEMIS // Terminal Output
        </span>
        {/* Filter buttons */}
        <div className="ml-auto flex gap-1">
          {['all', 'success', 'fail'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
                filter === f
                  ? 'bg-[var(--c-cyan)] text-[#060810] font-bold'
                  : 'text-[var(--c-text-dim)] hover:text-[var(--c-text)]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'success' ? '✓ OK' : '✗ Fail'}
            </button>
          ))}
        </div>
        <span className="ml-2 text-[10px] text-[var(--c-text-dim)] font-mono">
          {filtered.length} / {logs.length} entries
        </span>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1 pr-1 touch-scroll">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[var(--c-text-dim)] text-xs">Waiting for simulation data...</p>
          </div>
        ) : (
          filtered.map((log, i) => {
            const lvl = log.level || (log.success ? 'success' : 'fail');
            const style = LEVEL_STYLES[lvl] || LEVEL_STYLES.info;
            return (
              <div key={i} className={`animate-slide-in flex items-start gap-2 ${style.color}`}>
                <span className="flex-shrink-0 opacity-70">{style.prefix}</span>
                <span className="break-all leading-relaxed">{log.data}</span>
                {log.mitre && (
                  <span className={`ml-auto flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded font-bold ${style.badge}`}>
                    {log.mitre}
                  </span>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Cursor line */}
      <div className="mt-2 flex items-center gap-1 border-t border-[var(--c-border)] pt-2">
        <span className="text-[var(--c-cyan)] font-mono text-[11px]">root@artemis:~$</span>
        <span className="w-2 h-3.5 bg-[var(--c-cyan)] terminal-cursor" />
      </div>
    </div>
  );
};

export default TerminalLog;
