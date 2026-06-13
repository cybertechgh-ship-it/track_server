import api from './api';
import type { ApiResponse } from '../types';

export interface Payment {
  id: number; driverId: number | null; invoiceId: number | null;
  amount: number; method: 'cash' | 'mobile_money' | 'bank_transfer' | 'card' | 'other';
  reference: string | null; paidAt: string; receivedById: number | null; notes: string | null;
  createdAt: string; updatedAt: string;
}

export const paymentService = {
  async getAll(params?: Record<string, string>): Promise<Payment[]> {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const r = await api.get<ApiResponse<Payment[]>>(`/payments${qs}`);
      return r.data.data || [];
    } catch { return []; }
  },
  async create(data: Partial<Payment>): Promise<Payment> {
    const r = await api.post<ApiResponse<Payment>>('/payments', data);
    return r.data.data!;
  },
  async delete(id: number): Promise<void> { await api.delete(`/payments/${id}`); },
};
