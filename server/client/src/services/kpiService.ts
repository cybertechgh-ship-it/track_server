import api from './api';
import type { ApiResponse } from '../types';

export interface KPI {
  id: number;
  name: string;
  category: 'revenue' | 'operations' | 'safety' | 'maintenance' | 'driver' | 'fuel' | 'customer';
  metricKey: string;
  unit: string;
  target: number | null;
  current: number | null;
  previousValue: number | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  periodStart: string;
  periodEnd: string | null;
  organizationUnitId: number | null;
  driverId: number | null;
  vehicleId: number | null;
  isActive: boolean;
  notes: string | null;
}

export const kpiService = {
  async getAll(params?: Record<string, string>): Promise<KPI[]> {
    const r = await api.get<ApiResponse<KPI[]>>('/kpi', { params });
    return r.data.data || [];
  },
  async getDashboard(params?: Record<string, string>): Promise<any> {
    const r = await api.get<ApiResponse<any>>('/kpi/dashboard', { params });
    return r.data.data || {};
  },
  async getById(id: number): Promise<KPI> {
    const r = await api.get<ApiResponse<KPI>>(`/kpi/${id}`);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to fetch');
  },
  async create(data: Partial<KPI>): Promise<KPI> {
    const r = await api.post<ApiResponse<KPI>>('/kpi', data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to create');
  },
  async update(id: number, data: Partial<KPI>): Promise<KPI> {
    const r = await api.put<ApiResponse<KPI>>(`/kpi/${id}`, data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to update');
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/kpi/${id}`);
  },
};
