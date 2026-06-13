import api from './api';
import type { ApiResponse } from '../types';

export interface Expense {
  id: number; vehicleId: number | null; driverId: number | null;
  category: 'fuel' | 'maintenance' | 'toll' | 'parking' | 'insurance' | 'tax' | 'permits' | 'supplies' | 'utilities' | 'rent' | 'salary' | 'other';
  amount: number; description: string; receiptUrl: string | null;
  expenseDate: string; approvedById: number | null; notes: string | null;
  createdAt: string; updatedAt: string;
}

export const expenseService = {
  async getAll(params?: Record<string, string>): Promise<Expense[]> {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const r = await api.get<ApiResponse<Expense[]>>(`/expenses${qs}`);
      return r.data.data || [];
    } catch { return []; }
  },
  async getSummary(params?: Record<string, string>): Promise<any> {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const r = await api.get<any>(`/expenses/summary${qs}`);
      return r.data.data;
    } catch { return null; }
  },
  async create(data: Partial<Expense>): Promise<Expense> {
    const r = await api.post<ApiResponse<Expense>>('/expenses', data);
    return r.data.data!;
  },
  async update(id: number, data: Partial<Expense>): Promise<Expense> {
    const r = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
    return r.data.data!;
  },
  async delete(id: number): Promise<void> { await api.delete(`/expenses/${id}`); },
};
