import React from 'react';
import { useArtemis } from '../services/ArtemisContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFingerprint, FaExclamationCircle } from 'react-icons/fa';

const ThreatIntelPanel: React.FC = () => {
  const { intel } = useArtemis();

  return (
    <div className="panel flex-1 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
      <h2 className="text-xl font-mono text-red-400 mb-4 border-b border-red-500/30 pb-2">Threat Intelligence</h2>
      
      {intel ? (
        <AnimatePresence mode="wait">
          <motion.div 
            key={intel.cvss.score}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 font-mono text-sm"
          >
            {/* CVSS Section */}
            <div className="bg-black/40 p-3 rounded border border-red-900/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">CVSS v3.1</span>
                <span className={`font-bold px-2 py-0.5 rounded ${intel.cvss.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {intel.cvss.severity}
                </span>
              </div>
              <div className="text-3xl text-white mb-2">{intel.cvss.score}</div>
              <div className="text-xs text-gray-500 break-words">{intel.cvss.vector}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* MITRE ATT&CK */}
              <div className="bg-black/40 p-3 rounded border border-orange-900/50">
                <div className="text-gray-400 mb-1 flex items-center gap-2">
                  <FaFingerprint /> MITRE
                </div>
                <div className="text-orange-400 font-bold">{intel.mitre.id}</div>
                <div className="text-white text-xs mt-1 truncate">{intel.mitre.tactic}</div>
              </div>

              {/* CWE */}
              <div className="bg-black/40 p-3 rounded border border-yellow-900/50">
                <div className="text-gray-400 mb-1 flex items-center gap-2">
                  <FaExclamationCircle /> CWE
                </div>
                <div className="text-yellow-400 font-bold">{intel.cwe.id}</div>
                <div className="text-white text-xs mt-1 truncate" title={intel.cwe.description}>
                  {intel.cwe.description}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 font-mono italic">
          Waiting for threat intelligence...
        </div>
      )}
    </div>
  );
};

export default ThreatIntelPanel;
