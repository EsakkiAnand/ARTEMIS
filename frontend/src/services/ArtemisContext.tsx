import React, { useState, useEffect, createContext, useContext } from 'react';

type ArtemisState = {
  status: string;
  logs: any[];
  performance: any[];
  planner: any;
  explainability: any[];
  intel: any;
};

const initialState: ArtemisState = {
  status: 'IDLE',
  logs: [],
  performance: [],
  planner: null,
  explainability: [],
  intel: null
};

const ArtemisContext = createContext<ArtemisState>(initialState);

export const ArtemisProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, setState] = useState<ArtemisState>(initialState);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'initial_state') {
        setState(s => ({
          ...s,
          status: msg.data.status,
          logs: msg.data.logs,
          performance: msg.data.performance
        }));
      } else if (msg.type === 'status') {
        setState(s => ({ ...s, status: msg.data.status }));
      } else if (msg.type === 'log') {
        setState(s => ({ ...s, logs: [...s.logs.slice(-99), msg.data] }));
      } else if (msg.type === 'performance') {
        setState(s => ({ ...s, performance: [...s.performance.slice(-49), msg.data] }));
      } else if (msg.type === 'planner') {
        setState(s => ({ ...s, planner: msg.data }));
      } else if (msg.type === 'explainability') {
        setState(s => ({ ...s, explainability: msg.data }));
      } else if (msg.type === 'intel') {
        setState(s => ({ ...s, intel: msg.data }));
      }
    };

    return () => ws.close();
  }, []);

  return (
    <ArtemisContext.Provider value={state}>
      {children}
    </ArtemisContext.Provider>
  );
};

export const useArtemis = () => useContext(ArtemisContext);
