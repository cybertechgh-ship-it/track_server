import api from './api';
import type { ApiResponse } from '../types';

export interface IncidentReport {
  id: number;
  type: 'accident' | 'theft' | 'damage' | 'traffic_violation' | 'passenger_complaint' | 'disciplinary' | 'mechanical' | 'other';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  status: 'reported' | 'investigating' | 'escalated' | 'resolved' | 'closed';
  driverId: number | null;
  vehicleId: number | null;
  reportedById: number;
  assignedToId: number | null;
  dateOfIncident: string;
  location: string | null;
  description: string;
  findings: string | null;
  resolution: string | null;
  isEscalated: boolean;
  escalatedToId: number | null;
  escalatedAt: string | null;
  resolvedAt: string | null;
}

export const incidentService = {
  async getAll(params?: Record<string, string>): Promise<IncidentReport[]> {
    const r = await api.get<ApiResponse<IncidentReport[]>>('/incidents', { params });
    return r.data.data || [];
  },
  async getById(id: number): Promise<IncidentReport> {
    const r = await api.get<ApiResponse<IncidentReport>>(`/incidents/${id}`);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to fetch');
  },
  async create(data: Partial<IncidentReport>): Promise<IncidentReport> {
    const r = await api.post<ApiResponse<IncidentReport>>('/incidents', data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to create');
  },
  async update(id: number, data: Partial<IncidentReport>): Promise<IncidentReport> {
    const r = await api.put<ApiResponse<IncidentReport>>(`/incidents/${id}`, data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to update');
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/incidents/${id}`);
  },
  async escalate(id: number, data: { escalatedToId: number; note?: string }): Promise<IncidentReport> {
    const r = await api.post<ApiResponse<IncidentReport>>(`/incidents/${id}/escalate`, data);
    if (r.data.success && r.data.data) return r.data.data;
    throw new Error(r.data.message || 'Failed to escalate');
  },
};
