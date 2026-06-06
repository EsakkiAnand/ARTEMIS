import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useSimulation() {
  const socket = useSocket();

  const [status,            setStatus]            = useState('stopped');
  const [sandboxStatus,     setSandboxStatus]      = useState('unknown');
  const [logs,              setLogs]               = useState([]);
  const [metrics,           setMetrics]            = useState([]);
  const [shapData,          setShapData]           = useState(null);
  const [attackGraph,       setAttackGraph]        = useState({ nodes: [], edges: [] });
  const [plan,              setPlan]               = useState('');
  const [adaptivePlan,      setAdaptivePlan]       = useState('');
  const [recommendations,   setRecommendations]    = useState([]);
  const [episodeHistory,    setEpisodeHistory]     = useState([]);
  const [scenarios,         setScenarios]          = useState([]);
  const [activeScenario,    setActiveScenarioState] = useState('web_full');
  const [loading,           setLoading]            = useState(false);
  const [report,            setReport]             = useState(null);

  const pollRef = useRef(null);

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/status`);
      const data = await res.json();
      setStatus(data.simulation);
      setSandboxStatus(data.sandbox);
      setActiveScenarioState(data.scenario || 'web_full');
    } catch { setSandboxStatus('offline'); }
  }, []);

  const fetchPlan = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/plan`);
      const data = await res.json();
      setPlan(data.plan || '');
    } catch { setPlan('Backend offline — start the Flask server.'); }
  }, []);

  const fetchGraph = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/attack-graph`);
      const data = await res.json();
      setAttackGraph(data);
    } catch {}
  }, []);

  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/recommendations`);
      const data = await res.json();
      setRecommendations(data.structured || []);
    } catch {}
  }, []);

  const fetchScenarios = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/scenarios`);
      const data = await res.json();
      setScenarios(data.scenarios || []);
    } catch {}
  }, []);

  const fetchEpisodeHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/episode-history`);
      const data = await res.json();
      setEpisodeHistory(data.history || []);
    } catch {}
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/report`);
      const data = await res.json();
      setReport(data);
    } catch {}
  }, []);

  // ── Simulation controls ───────────────────────────────────────────────────
  const startSim = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/start`, { method: 'POST' });
      const data = await res.json();
      if (!data.error) {
        setStatus('running');
        setLogs([]);
        setMetrics([]);
        setEpisodeHistory([]);
        setReport(null);
        setAdaptivePlan('');
        // Refresh plan (may have changed with scenario)
        fetchPlan();
      }
    } finally { setLoading(false); }
  }, [fetchPlan]);

  const stopSim = useCallback(async () => {
    setLoading(true);
    try {
      await fetch(`${API}/api/stop`, { method: 'POST' });
      setStatus('stopped');
      // Fetch final data after stopping
      await Promise.all([
        fetchRecommendations(),
        fetchEpisodeHistory(),
        fetchReport(),
        fetchGraph(),
      ]);
    } finally { setLoading(false); }
  }, [fetchRecommendations, fetchEpisodeHistory, fetchReport, fetchGraph]);

  const setActiveScenario = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/api/scenarios/${id}/set`, { method: 'POST' });
      const data = await res.json();
      if (!data.error) setActiveScenarioState(id);
    } catch {}
  }, []);

  // ── WebSocket listeners ───────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on('log', (data) => {
      setLogs(prev => [...prev, { ...data, ts: Date.now() }].slice(-100));
    });

    socket.on('metrics', (data) => {
      setMetrics(prev => [...prev, { ...data, ts: Date.now() }].slice(-50));
    });

    socket.on('shap', (data) => {
      setShapData(data);
    });

    socket.on('attack_graph', (data) => {
      setAttackGraph(data);
    });

    socket.on('step_update', (data) => {
      setEpisodeHistory(prev => {
        // Avoid duplicates by step number
        const exists = prev.find(s => s.step === data.step);
        if (exists) return prev;
        return [...prev, data];
      });
    });

    socket.on('adaptive_plan', (data) => {
      setAdaptivePlan(data.data || '');
    });

    socket.on('countermeasure_report', (data) => {
      setReport(data);
      setRecommendations(data.recommendations || []);
    });

    socket.on('recommendations', (data) => {
      setRecommendations(Array.isArray(data) ? data : []);
    });

    socket.on('status_update', (data) => {
      if (data.simulation) setStatus(data.simulation);
      if (data.sandbox)    setSandboxStatus(data.sandbox);
    });

    socket.on('connect', () => {
      console.log('[ARTEMIS] Socket connected');
      fetchStatus();
    });

    socket.on('disconnect', () => {
      console.log('[ARTEMIS] Socket disconnected');
      setSandboxStatus('offline');
    });

    return () => {
      socket.off('log');
      socket.off('metrics');
      socket.off('shap');
      socket.off('attack_graph');
      socket.off('step_update');
      socket.off('adaptive_plan');
      socket.off('countermeasure_report');
      socket.off('recommendations');
      socket.off('status_update');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket, fetchStatus]);

  // ── Polling during simulation ─────────────────────────────────────────────
  useEffect(() => {
    if (status === 'running') {
      pollRef.current = setInterval(() => {
        fetchStatus();
        fetchGraph();
      }, 4000);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [status, fetchStatus, fetchGraph]);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchStatus();
    fetchPlan();
    fetchGraph();
    fetchScenarios();
    fetchEpisodeHistory();
    fetchRecommendations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    status, sandboxStatus, logs, metrics, shapData, attackGraph,
    plan, adaptivePlan, recommendations, episodeHistory, scenarios,
    activeScenario, loading, report,
    // Actions
    startSim, stopSim, setActiveScenario,
    fetchRecommendations, fetchEpisodeHistory, fetchReport,
  };
}
