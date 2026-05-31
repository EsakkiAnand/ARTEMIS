import React, { useEffect, useRef } from 'react';

const TerminalLog = ({ logs }) => {
  const endOfLogRef = useRef(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="glass-panel p-4 h-64 flex flex-col">
      <div className="flex items-center mb-2 border-b border-[#45a29e]/30 pb-2">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <h3 className="ml-4 font-mono text-[#66fcf1] text-sm tracking-widest">ARTEMIS // Terminal</h3>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-sm text-[#c5c6c7]">
        {logs.length === 0 ? (
          <p className="opacity-50 italic">Waiting for simulation data...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-1">
              <span className="text-[#45a29e] mr-2">root@artemis:~#</span>
              <span className={log.includes("Reward: -") ? "text-red-400" : log.includes("Reward:") ? "text-green-400" : ""}>{log}</span>
            </div>
          ))
        )}
        <div ref={endOfLogRef} />
      </div>
    </div>
  );
};

export default TerminalLog;
