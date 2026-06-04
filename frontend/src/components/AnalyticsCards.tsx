import React from 'react';
import { useArtemis } from '../services/ArtemisContext';
import { FaShieldAlt, FaBug, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const AnalyticsCards: React.FC = () => {
  const { performance, logs, status } = useArtemis();
  
  const successCount = performance.length > 0 ? performance[performance.length - 1].success_rate : 0;
  const avgReward = performance.length > 0 ? performance[performance.length - 1].average_reward : 0;
  const totalSims = performance.length > 0 ? performance[performance.length - 1].episode : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="panel border-t-2 border-t-primary flex items-center gap-4">
        <div className="p-3 bg-primary/20 rounded-full"><FaShieldAlt className="text-2xl text-primary" /></div>
        <div>
          <div className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Sims</div>
          <div className="text-2xl font-mono text-white">{totalSims}</div>
        </div>
      </div>
      
      <div className="panel border-t-2 border-t-success flex items-center gap-4">
        <div className="p-3 bg-success/20 rounded-full"><FaCheckCircle className="text-2xl text-success" /></div>
        <div>
          <div className="text-gray-400 text-xs uppercase font-bold tracking-wider">Success Rate</div>
          <div className="text-2xl font-mono text-white">{successCount}%</div>
        </div>
      </div>
      
      <div className="panel border-t-2 border-t-warning flex items-center gap-4">
        <div className="p-3 bg-warning/20 rounded-full"><FaExclamationTriangle className="text-2xl text-warning" /></div>
        <div>
          <div className="text-gray-400 text-xs uppercase font-bold tracking-wider">Avg Reward</div>
          <div className="text-2xl font-mono text-white">{avgReward}</div>
        </div>
      </div>
      
      <div className="panel border-t-2 border-t-danger flex items-center gap-4">
        <div className="p-3 bg-danger/20 rounded-full"><FaBug className="text-2xl text-danger" /></div>
        <div>
          <div className="text-gray-400 text-xs uppercase font-bold tracking-wider">System Status</div>
          <div className={`text-xl font-mono ${status === 'RUNNING' ? 'text-success' : 'text-secondary'}`}>{status}</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCards;
