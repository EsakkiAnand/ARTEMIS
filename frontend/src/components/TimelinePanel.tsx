import React from 'react';
import { useArtemis } from '../services/ArtemisContext';
import { motion, AnimatePresence } from 'framer-motion';

const TimelinePanel: React.FC = () => {
  const { logs } = useArtemis();

  return (
    <div className="panel flex-1 flex flex-col relative overflow-hidden h-[400px]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
      <h2 className="text-xl font-mono text-blue-400 mb-4 border-b border-blue-500/30 pb-2">Threat Timeline</h2>
      
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="relative border-l-2 border-blue-900 ml-3">
          <AnimatePresence>
            {logs.slice().reverse().map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 ml-4 relative"
              >
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[1.35rem] top-1.5 border border-black"></div>
                <div className="text-xs font-mono text-blue-300 mb-1">{log.timestamp.split(' ')[1]}</div>
                <div className="bg-black/40 p-2 rounded text-sm text-gray-300 font-mono border border-blue-900/50">
                  <span className="text-cyan-400 font-bold">[{log.level}]</span> {log.message}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TimelinePanel;
