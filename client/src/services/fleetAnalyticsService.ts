import api from './api';

export const fleetAnalyticsService = {
  async utilization(): Promise<any> { const r = await api.get('/fleet-analytics/utilization'); return r.data.data; },
  async driverScoreboard(): Promise<any> { const r = await api.get('/fleet-analytics/driver-scoreboard'); return r.data.data; },
  async costPerKm(): Promise<any> { const r = await api.get('/fleet-analytics/cost-per-km'); return r.data.data; },
  async idleMonitoring(): Promise<any> { const r = await api.get('/fleet-analytics/idle-monitoring'); return r.data.data; },
  async kpiComparison(startDate?: string, endDate?: string): Promise<any> {
    const qs = new URLSearchParams();
    if (startDate) qs.append('startDate', startDate);
    if (endDate) qs.append('endDate', endDate);
    const r = await api.get(`/fleet-analytics/kpi-comparison?${qs.toString()}`);
    return r.data.data;
  },
};
