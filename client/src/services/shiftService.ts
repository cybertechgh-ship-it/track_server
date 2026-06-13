import api from './api';
import type { ApiResponse } from '../types';

export interface DriverShift {
  id: number; driverId: number; date: string; startTime: string; endTime: string | null;
  type: 'morning' | 'afternoon' | 'night' | 'full_day' | 'custom';
  status: 'scheduled' | 'checked_in' | 'checked_out' | 'absent' | 'swapped';
  swappedWithDriverId: number | null; notes: string | null;
  createdAt: string; updatedAt: string;
}

export const shiftService = {
  async getAll(params?: Record<string, string>): Promise<DriverShift[]> {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const r = await api.get<ApiResponse<DriverShift[]>>(`/shifts${qs}`);
      return r.data.data || [];
    } catch { return []; }
  },
  async getSchedule(startDate: string, endDate: string): Promise<DriverShift[]> {
    try {
      const r = await api.get<ApiResponse<DriverShift[]>>(`/shifts/schedule?startDate=${startDate}&endDate=${endDate}`);
      return r.data.data || [];
    } catch { return []; }
  },
  async create(data: Partial<DriverShift>): Promise<DriverShift> { const r = await api.post<ApiResponse<DriverShift>>('/shifts', data); return r.data.data!; },
  async update(id: number, data: Partial<DriverShift>): Promise<DriverShift> { const r = await api.put<ApiResponse<DriverShift>>(`/shifts/${id}`, data); return r.data.data!; },
  async swap(id: number, targetDriverId: number): Promise<DriverShift> { const r = await api.post<ApiResponse<DriverShift>>(`/shifts/${id}/swap`, { targetDriverId }); return r.data.data!; },
  async delete(id: number): Promise<void> { await api.delete(`/shifts/${id}`); },
};
