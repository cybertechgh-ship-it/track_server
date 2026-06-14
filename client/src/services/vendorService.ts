import api from './api';
import type { ApiResponse } from '../types';

export interface Vendor {
  id: number; name: string;
  type: 'mechanic' | 'parts_supplier' | 'fuel_station' | 'insurance' | 'towing' | 'other';
  contactPerson: string | null; phone: string | null; email: string | null;
  address: string | null; rating: number | null; notes: string | null; isActive: boolean;
  logo?: string | null;
  createdAt: string; updatedAt: string;
}

export const vendorService = {
  async getAll(params?: Record<string, string>): Promise<Vendor[]> {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const r = await api.get<ApiResponse<Vendor[]>>(`/vendors${qs}`);
      return r.data.data || [];
    } catch { return []; }
  },
  async create(data: Partial<Vendor>): Promise<Vendor> { const r = await api.post<ApiResponse<Vendor>>('/vendors', data); return r.data.data!; },
  async update(id: number, data: Partial<Vendor>): Promise<Vendor> { const r = await api.put<ApiResponse<Vendor>>(`/vendors/${id}`, data); return r.data.data!; },
  async delete(id: number): Promise<void> { await api.delete(`/vendors/${id}`); },
};
