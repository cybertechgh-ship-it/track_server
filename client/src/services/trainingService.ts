import api from './api';
import type { ApiResponse } from '../types';

export interface Training {
  id: number; driverId: number;
  type: 'defensive_driving' | 'safety' | 'certification' | 'refresher' | 'compliance' | 'other';
  title: string; provider: string | null; completionDate: string;
  expiryDate: string | null; certificateUrl: string | null; score: number | null; notes: string | null;
  createdAt: string; updatedAt: string;
}

export const trainingService = {
  async getAll(params?: Record<string, string>): Promise<Training[]> {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const r = await api.get<ApiResponse<Training[]>>(`/training${qs}`);
      return r.data.data || [];
    } catch { return []; }
  },
  async getExpiring(): Promise<Training[]> {
    try {
      const r = await api.get<ApiResponse<Training[]>>('/training/expiring');
      return r.data.data || [];
    } catch { return []; }
  },
  async create(data: Partial<Training>): Promise<Training> {
    const r = await api.post<ApiResponse<Training>>('/training', data);
    return r.data.data!;
  },
  async update(id: number, data: Partial<Training>): Promise<Training> {
    const r = await api.put<ApiResponse<Training>>(`/training/${id}`, data);
    return r.data.data!;
  },
  async delete(id: number): Promise<void> { await api.delete(`/training/${id}`); },
};
