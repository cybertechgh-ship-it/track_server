import api from './api';
import type { ApiResponse } from '../types';

export interface Invoice {
  id: number; clientName: string; clientEmail: string | null;
  clientAddress: string | null; invoiceNumber: string; items: any;
  subtotal: number; tax: number; total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string; paidAt: string | null; notes: string | null;
  createdAt: string; updatedAt: string;
}

export const invoiceService = {
  async getAll(params?: Record<string, string>): Promise<Invoice[]> {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const r = await api.get<ApiResponse<Invoice[]>>(`/invoices${qs}`);
      return r.data.data || [];
    } catch { return []; }
  },
  async getStats(): Promise<any> {
    try {
      const r = await api.get<any>('/invoices/stats');
      return r.data.data;
    } catch { return null; }
  },
  async create(data: Partial<Invoice>): Promise<Invoice> {
    const r = await api.post<ApiResponse<Invoice>>('/invoices', data);
    return r.data.data!;
  },
  async update(id: number, data: Partial<Invoice>): Promise<Invoice> {
    const r = await api.put<ApiResponse<Invoice>>(`/invoices/${id}`, data);
    return r.data.data!;
  },
  async delete(id: number): Promise<void> { await api.delete(`/invoices/${id}`); },
};
