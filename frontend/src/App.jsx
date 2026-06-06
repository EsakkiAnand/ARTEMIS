import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { useSimulation } from './hooks/useSimulation';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ScenariosPage from './pages/ScenariosPage';
import ReportPage from './pages/ReportPage';

// bg-grid overlay + scanlines
const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-grid opacity-30" />
    <div className="absolute inset-0 bg-gradient-to-br from-[rgba(99,210,201,0.03)] via-transparent to-[rgba(181,126,255,0.03)]" />
  </div>
);

function AppInner() {
  const sim = useSimulation();
  return (
    <BrowserRouter>
      <div className="relative flex min-h-screen">
        <BG />
        <Navbar status={sim.status} />
        <main className="flex-1 p-6 overflow-y-auto relative z-10 min-w-0">
          <Routes>
            <Route path="/"          element={<DashboardPage sim={sim} />} />
            <Route path="/scenarios" element={<ScenariosPage sim={sim} />} />
            <Route path="/report"    element={<ReportPage    sim={sim} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <SocketProvider>
      <AppInner />
    </SocketProvider>
  );
}

export default App;
