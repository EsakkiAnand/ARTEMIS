import React, { useEffect, useRef, useState } from 'react';
import { useArtemis } from '../services/ArtemisContext';
import { FaPlay, FaPause, FaDownload, FaSearch } from 'react-icons/fa';

const TerminalPanel: React.FC = () => {
  const { logs } = useArtemis();
  const endRef = useRef<HTMLDivElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [displayedLogs, setDisplayedLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!isPaused) {
      setDisplayedLogs(logs);
    }
  }, [logs, isPaused]);

  useEffect(() => {
    if (autoScroll && !isPaused) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedLogs, autoScroll, isPaused]);

  const getLogColor = (level: string) => {
    switch(level) {
      case 'INFO': return 'text-primary';
      case 'SCAN': return 'text-secondary';
      case 'AI': return 'text-purple-400';
      case 'ANALYTICS': return 'text-success';
      case 'REPORT': return 'text-blue-400';
      case 'WARNING': return 'text-warning';
      default: return 'text-gray-400';
    }
  };
  
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "artemis_terminal_logs.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filteredLogs = displayedLogs.filter(l => 
    (filterLevel === 'ALL' || l.level === filterLevel) &&
    (searchTerm === '' || l.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="panel flex-1 flex flex-col relative overflow-hidden h-[400px]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary"></div>
      
      <div className="flex justify-between items-center mb-2 border-b border-secondary/30 pb-2">
        <h2 className="text-xl font-mono text-secondary">ARTEMIS Terminal</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/40 px-2 py-1 rounded border border-gray-700">
            <FaSearch className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent text-xs text-white outline-none w-24 focus:w-32 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-black/40 text-xs text-gray-300 border border-gray-700 rounded px-1 py-1 outline-none"
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
          >
            <option value="ALL">ALL</option>
            <option value="INFO">INFO</option>
            <option value="SCAN">SCAN</option>
            <option value="AI">AI</option>
            <option value="WARNING">WARNING</option>
          </select>
          <button onClick={() => setIsPaused(!isPaused)} className={`p-1.5 rounded ${isPaused ? 'bg-warning/20 text-warning' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {isPaused ? <FaPlay size={12} /> : <FaPause size={12} />}
          </button>
          <button onClick={handleExport} className="p-1.5 bg-gray-800 text-gray-400 hover:text-white rounded" title="Export Logs">
            <FaDownload size={12} />
          </button>
        </div>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto font-mono text-xs bg-black/50 rounded p-4"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          setAutoScroll(target.scrollHeight - target.scrollTop === target.clientHeight);
        }}
      >
        {filteredLogs.map((log, i) => (
          <div key={i} className="mb-1 hover:bg-gray-800/50 px-1 rounded transition-colors">
            <span className="text-gray-500">[{log.timestamp.split(' ')[1]}]</span>{' '}
            <span className={`font-bold ${getLogColor(log.level)}`}>[{log.level}]</span>{' '}
            <span className="text-gray-300">{log.message}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default TerminalPanel;
