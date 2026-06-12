import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface SimulationStatus {
  running: boolean;
  activeVehicles: number;
}

export function useSimulation() {
  const [status, setStatus] = useState<SimulationStatus>({ running: false, activeVehicles: 0 });
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: SimulationStatus }>('/simulation/status');
      setStatus(res.data.data);
    } catch {
      // simulation endpoint may not exist yet
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const start = async () => {
    setLoading(true);
    try {
      await api.post('/simulation/start');
      setStatus(s => ({ ...s, running: true }));
    } finally {
      setLoading(false);
    }
  };

  const stop = async () => {
    setLoading(true);
    try {
      await api.post('/simulation/stop');
      setStatus(s => ({ ...s, running: false }));
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    try {
      await api.post('/simulation/refresh');
    } catch { /* ignore */ }
  };

  return { status, loading, start, stop, refresh, fetchStatus };
}
