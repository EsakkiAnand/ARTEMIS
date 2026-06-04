import React from 'react';
import { useArtemis } from '../services/ArtemisContext';

const HealthPanel: React.FC = () => {
  const { status } = useArtemis();

  // Simulated health statuses based on overall state
  const isUp = status !== 'FAILED';
  const llmStatus = isUp ? 'success' : 'danger';
  const dockerStatus = isUp ? 'success' : 'warning';
  
  const getDot = (state: string) => {
    const colors = {
      'success': 'bg-success shadow-[0_0_8px_#00E676]',
      'warning': 'bg-warning shadow-[0_0_8px_#FFC107]',
      'danger': 'bg-danger shadow-[0_0_8px_#FF3D00]'
    };
    return <div className={`w-2.5 h-2.5 rounded-full ${colors[state as keyof typeof colors]}`}></div>;
  };

  return (
    <div className="panel flex-1 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 to-gray-400"></div>
      <h2 className="text-xl font-mono text-gray-300 mb-4 border-b border-gray-700 pb-2">System Health</h2>
      
      <div className="grid grid-cols-2 gap-4 text-sm font-mono text-gray-400">
        <div className="flex items-center justify-between bg-black/40 p-2 rounded">
          <span>Backend API</span>
          {getDot('success')}
        </div>
        <div className="flex items-center justify-between bg-black/40 p-2 rounded">
          <span>Frontend Client</span>
          {getDot('success')}
        </div>
        <div className="flex items-center justify-between bg-black/40 p-2 rounded">
          <span>WebSocket Stream</span>
          {getDot(isUp ? 'success' : 'danger')}
        </div>
        <div className="flex items-center justify-between bg-black/40 p-2 rounded">
          <span>Simulation Engine</span>
          {getDot(isUp ? 'success' : 'danger')}
        </div>
        <div className="flex items-center justify-between bg-black/40 p-2 rounded">
          <span>LLM Provider (Groq)</span>
          {getDot(llmStatus)}
        </div>
        <div className="flex items-center justify-between bg-black/40 p-2 rounded">
          <span>Docker Lab</span>
          {getDot(dockerStatus)}
        </div>
      </div>
    </div>
  );
};

export default HealthPanel;
