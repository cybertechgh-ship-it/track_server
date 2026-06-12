import api from './api';
import type { ApiResponse } from '../types';

export interface DisciplinaryAction {
  id: number;
  incidentReportId: number | null;
  driverId: number;
  type: 'warning' | 'suspension' | 'fine' | 'demotion' | 'termination' | 'training';
  severity: 'verbal' | 'written' | 'final' | 'immediate';
  reason: string;
  description: string;
  startDate: string;
  endDate: string | null;
  status: 'pending' | 'approved' | 'executed' | 'appealed' | 'overturned';
  issuedById: number;
  approvedById: number | null;
  approvedAt: string | null;
  evidence: string | null;
}

export const disciplinaryService = {
  async getAll(params?: Record<string, string>): Promise<DisciplinaryAction[]> {
    const r = await api.get<ApiResponse<DisciplinaryAction[]>>('/disciplinary', { params });
    return r.data.data || [];
  },
  async getById(id: number): Promise<DisciplinaryAction> {
    const r = await api.get<ApiResponse<DisciplinaryAction>>(`/disciplinary/${id}`);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to fetch');
  },
  async create(data: Partial<DisciplinaryAction>): Promise<DisciplinaryAction> {
    const r = await api.post<ApiResponse<DisciplinaryAction>>('/disciplinary', data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to create');
  },
  async update(id: number, data: Partial<DisciplinaryAction>): Promise<DisciplinaryAction> {
    const r = await api.put<ApiResponse<DisciplinaryAction>>(`/disciplinary/${id}`, data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to update');
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/disciplinary/${id}`);
  },
};
