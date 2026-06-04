import React from 'react';
import { useArtemis } from '../services/ArtemisContext';

const ExecutiveSummary: React.FC = () => {
  const { status, intel } = useArtemis();

  const riskScore = intel ? intel.cvss.score : 0;
  const threatLevel = riskScore > 8 ? 'CRITICAL' : riskScore > 5 ? 'ELEVATED' : 'NOMINAL';

  return (
    <div className="panel flex-1 flex flex-col relative overflow-hidden bg-black/60 border-yellow-500/30">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 to-orange-500"></div>
      <h2 className="text-xl font-mono text-yellow-500 mb-4 border-b border-yellow-500/30 pb-2">Executive Overview</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/40 p-4 border border-gray-700 rounded text-center">
          <div className="text-gray-400 text-xs mb-1 tracking-widest">THREAT LEVEL</div>
          <div className={`text-2xl font-bold ${threatLevel === 'CRITICAL' ? 'text-red-500' : 'text-yellow-500'}`}>
            {threatLevel}
          </div>
        </div>
        
        <div className="bg-black/40 p-4 border border-gray-700 rounded text-center">
          <div className="text-gray-400 text-xs mb-1 tracking-widest">RISK SCORE</div>
          <div className="text-2xl font-bold text-white">
            {riskScore.toFixed(1)} / 10.0
          </div>
        </div>

        <div className="bg-black/40 p-4 border border-gray-700 rounded text-center">
          <div className="text-gray-400 text-xs mb-1 tracking-widest">ACTIVE SCENARIO</div>
          <div className="text-sm font-bold text-blue-400 mt-2 truncate">
            Web Server Exposure
          </div>
        </div>

        <div className="bg-black/40 p-4 border border-gray-700 rounded text-center">
          <div className="text-gray-400 text-xs mb-1 tracking-widest">RISK REDUCTION</div>
          <div className="text-2xl font-bold text-success">
            ~84%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
