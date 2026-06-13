import api from './api';
import type { ApiResponse } from '../types';

export interface Insurance {
  id: number; vehicleId: number; policyNumber: string; provider: string;
  type: 'comprehensive' | 'third_party' | 'liability' | 'collision';
  startDate: string; endDate: string; premium: number;
  coverageDetails: string | null; documents: any; isActive: boolean; notes: string | null;
  createdAt: string; updatedAt: string;
}

export const insuranceService = {
  async getAll(params?: Record<string, string>): Promise<Insurance[]> {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const r = await api.get<ApiResponse<Insurance[]>>(`/insurance${qs}`);
      return r.data.data || [];
    } catch { return []; }
  },
  async getExpiring(): Promise<Insurance[]> {
    try {
      const r = await api.get<ApiResponse<Insurance[]>>('/insurance/expiring');
      return r.data.data || [];
    } catch { return []; }
  },
  async create(data: Partial<Insurance>): Promise<Insurance> {
    const r = await api.post<ApiResponse<Insurance>>('/insurance', data);
    return r.data.data!;
  },
  async update(id: number, data: Partial<Insurance>): Promise<Insurance> {
    const r = await api.put<ApiResponse<Insurance>>(`/insurance/${id}`, data);
    return r.data.data!;
  },
  async delete(id: number): Promise<void> { await api.delete(`/insurance/${id}`); },
};
