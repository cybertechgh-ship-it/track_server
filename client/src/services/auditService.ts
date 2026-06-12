import api from './api';
import type { ApiResponse } from '../types';

export interface AuditLogEntry {
  id: number;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login' | 'logout' | 'export';
  entityType: string;
  entityId: number | null;
  userId: number | null;
  description: string;
  changes: any;
  ipAddress: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected' | null;
  approvedById: number | null;
  approvedAt: string | null;
  createdAt: string;
}

export const auditService = {
  async getAll(params?: Record<string, string>): Promise<AuditLogEntry[]> {
    const r = await api.get<ApiResponse<AuditLogEntry[]>>('/audit', { params });
    return r.data.data || [];
  },
  async getById(id: number): Promise<AuditLogEntry> {
    const r = await api.get<ApiResponse<AuditLogEntry>>(`/audit/${id}`);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to fetch');
  },
  async getSummary(params?: Record<string, string>): Promise<any> {
    const r = await api.get<ApiResponse<any>>('/audit/summary', { params });
    return r.data.data || {};
  },
};
