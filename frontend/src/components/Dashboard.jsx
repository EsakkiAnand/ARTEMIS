import React, { useState, useEffect } from 'react';
import { Play, Square, ShieldAlert, Cpu } from 'lucide-react';
import TerminalLog from './TerminalLog';
import MetricsChart from './MetricsChart';
import ShapAnalysis from './ShapAnalysis';

const Dashboard = ({ socket }) => {
  const [status, setStatus] = useState("stopped");
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [shapData, setShapData] = useState(null);
  const [plan, setPlan] = useState("");

  useEffect(() => {
    fetchStatus();
    fetchPlan();

    socket.on('log', (data) => {
      setLogs((prev) => [...prev, data.data].slice(-50)); // Keep last 50 logs
    });

    socket.on('metrics', (data) => {
      setMetrics((prev) => [...prev, data].slice(-20)); // Keep last 20 data points
    });

    socket.on('shap', (data) => {
      setShapData(data);
    });

    return () => {
      socket.off('log');
      socket.off('metrics');
      socket.off('shap');
    };
  }, [socket]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/status');
      const data = await res.json();
      setStatus(data.simulation);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPlan = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/plan');
      const data = await res.json();
      setPlan(data.plan);
    } catch (e) {
      console.error(e);
    }
  };

  const startSim = async () => {
    await fetch('http://localhost:5000/api/start', { method: 'POST' });
    setStatus("running");
  };

  const stopSim = async () => {
    await fetch('http://localhost:5000/api/stop', { method: 'POST' });
    setStatus("stopped");
  };

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6">
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-[#45a29e]/30">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-[#66fcf1]" size={32} />
          <div>
            <h1 className="text-3xl font-bold tracking-wider neon-text">ARTEMIS</h1>
            <p className="text-xs text-[#45a29e] tracking-widest uppercase">Autonomous Attack Simulator</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm">Status:</span>
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${status === 'running' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
              {status}
            </span>
          </div>
          
          {status === 'stopped' ? (
            <button onClick={startSim} className="btn-primary flex items-center gap-2">
              <Play size={18} /> Start Simulation
            </button>
          ) : (
            <button onClick={stopSim} className="btn-danger flex items-center gap-2">
              <Square size={18} /> Stop Simulation
            </button>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column - LLM Plan & terminal */}
        <div className="flex flex-col gap-6 col-span-1">
          <div className="glass-panel p-4 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3 border-b border-[#45a29e]/30 pb-2">
              <Cpu className="text-[#66fcf1]" size={20} />
              <h3 className="font-semibold text-[#66fcf1]">LLM Planner Strategy</h3>
            </div>
            <div className="text-sm opacity-90 whitespace-pre-wrap font-mono leading-relaxed">
              {plan || "Loading strategy..."}
            </div>
          </div>
          <TerminalLog logs={logs} />
        </div>

        {/* Right Column - RL Metrics & SHAP */}
        <div className="flex flex-col gap-6 col-span-1 lg:col-span-2">
          <MetricsChart data={metrics} />
          <ShapAnalysis data={shapData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
