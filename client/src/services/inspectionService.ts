import api from './api';
import type { ApiResponse } from '../types';

export interface InspectionChecklist {
  id: number; vehicleId: number; driverId: number | null;
  type: 'checkout' | 'checkin'; items: any; notes: string | null;
  odometer: number | null; fuelLevel: number | null; photos: any;
  issuesReported: string | null; isCleared: boolean;
  createdAt: string; updatedAt: string;
}

export const inspectionService = {
  async getAll(params?: Record<string, string>): Promise<InspectionChecklist[]> {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const r = await api.get<ApiResponse<InspectionChecklist[]>>(`/inspections${qs}`);
      return r.data.data || [];
    } catch { return []; }
  },
  async create(data: Partial<InspectionChecklist>): Promise<InspectionChecklist> {
    const r = await api.post<ApiResponse<InspectionChecklist>>('/inspections', data);
    return r.data.data!;
  },
  async delete(id: number): Promise<void> { await api.delete(`/inspections/${id}`); },
};
