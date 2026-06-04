import React from 'react';
import { useArtemis } from '../services/ArtemisContext';
import { motion } from 'framer-motion';

const PlannerPanel: React.FC = () => {
  const { planner } = useArtemis();

  return (
    <div className="panel flex-1 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
      <h2 className="text-xl font-mono text-primary mb-4 border-b border-primary/30 pb-2">LLM Planner Strategy</h2>
      
      {planner ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 font-mono text-sm"
        >
          <div className="flex justify-between items-center bg-black/30 p-3 rounded">
            <span className="text-secondary">Current Objective:</span>
            <span className="text-white">{planner.objective}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 p-3 rounded flex flex-col gap-1">
              <span className="text-secondary text-xs">Risk Level</span>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                  <div className="bg-warning h-2.5 rounded-full" style={{ width: `${planner.risk_score}%` }}></div>
                </div>
                <span className="text-warning">{planner.risk_score}</span>
              </div>
            </div>
            
            <div className="bg-black/30 p-3 rounded flex flex-col gap-1">
              <span className="text-secondary text-xs">Confidence Score</span>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                  <div className="bg-success h-2.5 rounded-full" style={{ width: `${planner.confidence}%` }}></div>
                </div>
                <span className="text-success">{planner.confidence}%</span>
              </div>
            </div>
          </div>

          <div className="bg-black/30 p-3 rounded mt-2">
            <span className="text-secondary block mb-2">Recommended Simulation Path:</span>
            <div className="text-primary break-words">
              {planner.path}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 font-mono italic">
          Waiting for strategy generation...
        </div>
      )}
    </div>
  );
};

export default PlannerPanel;
