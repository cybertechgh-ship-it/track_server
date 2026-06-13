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
    try {
      const r = await api.get<ApiResponse<DisciplinaryAction[]>>('/disciplinary', { params });
      return r.data.data || [];
    } catch { return []; }
  },
  async getById(id: number): Promise<DisciplinaryAction | null> {
    try {
      const r = await api.get<ApiResponse<DisciplinaryAction>>(`/disciplinary/${id}`);
      return r.data.data || null;
    } catch { return null; }
  },
  async create(data: Partial<DisciplinaryAction>): Promise<DisciplinaryAction> {
    const r = await api.post<ApiResponse<DisciplinaryAction>>('/disciplinary', data);
    return r.data.data!;
  },
  async update(id: number, data: Partial<DisciplinaryAction>): Promise<DisciplinaryAction> {
    const r = await api.put<ApiResponse<DisciplinaryAction>>(`/disciplinary/${id}`, data);
    return r.data.data!;
  },
  async delete(id: number): Promise<void> { await api.delete(`/disciplinary/${id}`); },
};
