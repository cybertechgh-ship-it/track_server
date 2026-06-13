import api from './api';
import type { ApiResponse } from '../types';

export interface Webhook {
  id: number; name: string; url: string; events: string[];
  secret: string | null; isActive: boolean;
  lastTriggeredAt: string | null; failureCount: number;
  createdAt: string; updatedAt: string;
}

export const webhookService = {
  async getAll(): Promise<Webhook[]> {
    try { const r = await api.get<ApiResponse<Webhook[]>>('/webhooks'); return r.data.data || []; }
    catch { return []; }
  },
  async create(data: Partial<Webhook>): Promise<Webhook> { const r = await api.post<ApiResponse<Webhook>>('/webhooks', data); return r.data.data!; },
  async update(id: number, data: Partial<Webhook>): Promise<Webhook> { const r = await api.put<ApiResponse<Webhook>>(`/webhooks/${id}`, data); return r.data.data!; },
  async delete(id: number): Promise<void> { await api.delete(`/webhooks/${id}`); },
  async test(id: number): Promise<any> { const r = await api.post<any>(`/webhooks/${id}/test`); return r.data; },
};
