import api from './api';
import type { ApiResponse } from '../types';

export interface RevenueRecord {
  id: number;
  deploymentId: number;
  driverId: number;
  vehicleId: number;
  supervisorId: number | null;
  amount: number;
  expectedAmount: number | null;
  currency: string;
  collectionDate: string;
  shiftType: 'day' | 'night' | 'split';
  passengerCount: number | null;
  tripCount: number | null;
  status: 'collected' | 'remitted' | 'short' | 'over' | 'pending';
  remittanceDate: string | null;
  remittedById: number | null;
  notes: string | null;
}

export const revenueService = {
  async getAll(params?: Record<string, string>): Promise<RevenueRecord[]> {
    const r = await api.get<ApiResponse<RevenueRecord[]>>('/revenue', { params });
    return r.data.data || [];
  },
  async getSummary(params?: Record<string, string>): Promise<any> {
    const r = await api.get<ApiResponse<any>>('/revenue/summary', { params });
    return r.data.data || {};
  },
  async getById(id: number): Promise<RevenueRecord> {
    const r = await api.get<ApiResponse<RevenueRecord>>(`/revenue/${id}`);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to fetch');
  },
  async create(data: Partial<RevenueRecord>): Promise<RevenueRecord> {
    const r = await api.post<ApiResponse<RevenueRecord>>('/revenue', data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to create');
  },
  async update(id: number, data: Partial<RevenueRecord>): Promise<RevenueRecord> {
    const r = await api.put<ApiResponse<RevenueRecord>>(`/revenue/${id}`, data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to update');
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/revenue/${id}`);
  },
  async markRemitted(id: number): Promise<RevenueRecord> {
    const r = await api.post<ApiResponse<RevenueRecord>>(`/revenue/${id}/remit`);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to mark remitted');
  },
};
