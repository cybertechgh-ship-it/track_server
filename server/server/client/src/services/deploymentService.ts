import api from './api';
import type { ApiResponse } from '../types';

export interface Deployment {
  id: number;
  driverId: number;
  vehicleId: number;
  supervisorId: number | null;
  organizationUnitId: number | null;
  type: 'permanent' | 'temporary' | 'pool' | 'reserve';
  startDate: string;
  endDate: string | null;
  shiftPattern: 'daily' | 'rotating' | 'split' | 'flexible';
  status: 'active' | 'completed' | 'suspended' | 'cancelled';
  approvedById: number | null;
  approvedAt: string | null;
  notes: string | null;
}

export const deploymentService = {
  async getAll(params?: Record<string, string>): Promise<Deployment[]> {
    const r = await api.get<ApiResponse<Deployment[]>>('/deployments', { params });
    return r.data.data || [];
  },
  async getActive(): Promise<Deployment[]> {
    const r = await api.get<ApiResponse<Deployment[]>>('/deployments/active');
    return r.data.data || [];
  },
  async getById(id: number): Promise<Deployment> {
    const r = await api.get<ApiResponse<Deployment>>(`/deployments/${id}`);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to fetch');
  },
  async create(data: Partial<Deployment>): Promise<Deployment> {
    const r = await api.post<ApiResponse<Deployment>>('/deployments', data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to create');
  },
  async update(id: number, data: Partial<Deployment>): Promise<Deployment> {
    const r = await api.put<ApiResponse<Deployment>>(`/deployments/${id}`, data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to update');
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/deployments/${id}`);
  },
};
