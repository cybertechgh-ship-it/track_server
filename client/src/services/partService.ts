import api from './api';
import type { ApiResponse } from '../types';

export interface Part {
  id: number; name: string; partNumber: string | null;
  category: 'engine' | 'brake' | 'suspension' | 'electrical' | 'body' | 'tire' | 'filter' | 'other';
  quantity: number; minStock: number; unitPrice: number;
  supplier: string | null; location: string | null; notes: string | null;
  createdAt: string; updatedAt: string;
}

export const partService = {
  async getAll(lowStock?: boolean): Promise<Part[]> {
    try {
      const qs = lowStock ? '?lowStock=true' : '';
      const r = await api.get<ApiResponse<Part[]>>(`/parts${qs}`);
      return r.data.data || [];
    } catch { return []; }
  },
  async create(data: Partial<Part>): Promise<Part> { const r = await api.post<ApiResponse<Part>>('/parts', data); return r.data.data!; },
  async update(id: number, data: Partial<Part>): Promise<Part> { const r = await api.put<ApiResponse<Part>>(`/parts/${id}`, data); return r.data.data!; },
  async delete(id: number): Promise<void> { await api.delete(`/parts/${id}`); },
};
