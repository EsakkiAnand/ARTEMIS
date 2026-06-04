import React from 'react';
import { useArtemis } from '../services/ArtemisContext';
import { motion, AnimatePresence } from 'framer-motion';

const ExplainabilityPanel: React.FC = () => {
  const { explainability } = useArtemis();

  return (
    <div className="panel flex-1 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-primary"></div>
      <h2 className="text-xl font-mono text-purple-400 mb-4 border-b border-purple-500/30 pb-2">Decision Factor Analysis (Simulated SHAP)</h2>
      
      <div className="flex-1 flex flex-col justify-center gap-4">
        {explainability.length > 0 ? (
          <AnimatePresence>
            {explainability.map((item, i) => (
              <motion.div 
                key={item.feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col gap-1"
              >
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-gray-300">{item.feature}</span>
                  <span className="text-primary font-bold">{item.importance}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.importance}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-r from-purple-600 to-primary h-full"
                  ></motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-mono italic">
            Waiting for analytics...
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplainabilityPanel;
