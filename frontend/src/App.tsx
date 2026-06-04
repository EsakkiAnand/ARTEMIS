import React from 'react';
import Header from './components/Header';
import PlannerPanel from './components/PlannerPanel';
import TerminalPanel from './components/TerminalPanel';
import RewardChart from './components/RewardChart';
import ExplainabilityPanel from './components/ExplainabilityPanel';
import AttackGraph from './components/AttackGraph';
import TimelinePanel from './components/TimelinePanel';
import AnalyticsCards from './components/AnalyticsCards';
import ThreatIntelPanel from './components/ThreatIntelPanel';
import HealthPanel from './components/HealthPanel';
import ExecutiveSummary from './components/ExecutiveSummary';
import Login from './components/Login';
import { api } from './services/api';

function App() {
  const [token, setToken] = React.useState<string | null>(localStorage.getItem('artemis_token'));

  if (!token) {
    return <Login onLogin={(t) => {
      localStorage.setItem('artemis_token', t);
      api.setToken(t);
      setToken(t);
    }} />;
  }

  return (
    <div className="min-h-screen bg-background text-white p-4 font-sans flex flex-col gap-4">
      <Header />
      <AnalyticsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4 h-full">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <ExecutiveSummary />
          <TimelinePanel />
          <PlannerPanel />
          <TerminalPanel />
        </div>
        
        <div className="flex flex-col gap-4 lg:col-span-2">
          <AttackGraph />
          <RewardChart />
        </div>
        
        
        <div className="flex flex-col gap-4 lg:col-span-1">
          <ThreatIntelPanel />
          <ExplainabilityPanel />
          <HealthPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
