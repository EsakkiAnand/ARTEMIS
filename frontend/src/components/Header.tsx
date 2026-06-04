import React from 'react';
import { useArtemis } from '../services/ArtemisContext';
import { api } from '../services/api';
import { FaShieldAlt } from 'react-icons/fa';

const Header: React.FC = () => {
  const { status } = useArtemis();

  const getStatusColor = () => {
    switch(status) {
      case 'RUNNING': return 'text-success border-success';
      case 'IDLE': return 'text-secondary border-secondary';
      case 'COMPLETED': return 'text-primary border-primary';
      case 'FAILED': return 'text-danger border-danger';
      case 'PAUSED': return 'text-warning border-warning';
      default: return 'text-secondary border-secondary';
    }
  };

  const handleDemo = async () => {
    if (status === 'RUNNING') return;
    await api.startSimulation();
    setTimeout(() => {
      api.stopSimulation();
      setTimeout(() => {
        window.open(api.getReportUrl());
      }, 2000);
    }, 45000);
  };

  return (
    <header className="panel flex items-center justify-between border-b-2 border-primary glow-border">
      <div className="flex items-center gap-4">
        <FaShieldAlt className="text-4xl text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest">ARTEMIS</h1>
          <p className="text-xs text-secondary tracking-[0.2em]">AUTONOMOUS ATTACK SIMULATOR</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button
          onClick={() => window.open('http://localhost:8000/simulation/report')}
          className="px-4 py-1 text-sm bg-blue-500/20 text-blue-400 border border-blue-500 rounded font-bold hover:bg-blue-500/40 transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)]"
        >
          EXPORT REPORT
        </button>
        <button 
          onClick={handleDemo}
          disabled={status === 'RUNNING'}
          className="px-4 py-1 text-sm bg-purple-500/20 text-purple-400 border border-purple-500 rounded font-bold hover:bg-purple-500/40 transition-all disabled:opacity-50"
        >
          RUN DEMO
        </button>
        <div className={`px-4 py-1 rounded border ${getStatusColor()} font-mono text-sm tracking-widest uppercase`}>
          {status}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => api.startSimulation()}
            className="px-6 py-2 bg-primary/20 hover:bg-primary/40 text-primary border border-primary rounded font-bold transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]"
          >
            START SIMULATION
          </button>
          <button 
            onClick={() => api.stopSimulation()}
            className="px-6 py-2 bg-danger/20 hover:bg-danger/40 text-danger border border-danger rounded font-bold transition-all shadow-[0_0_10px_rgba(255,61,0,0.2)] hover:shadow-[0_0_20px_rgba(255,61,0,0.6)]"
          >
            STOP
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
