import api from './api';
import type { ApiResponse } from '../types';

export interface VehicleBooking {
  id: number; vehicleId: number; driverId: number | null; bookedById: number;
  purpose: string; startTime: string; endTime: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled'; notes: string | null;
  createdAt: string; updatedAt: string;
}

export const bookingService = {
  async getAll(params?: Record<string, string>): Promise<VehicleBooking[]> {
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const r = await api.get<ApiResponse<VehicleBooking[]>>(`/bookings${qs}`);
      return r.data.data || [];
    } catch { return []; }
  },
  async checkAvailability(vehicleId: number, startTime: string, endTime: string): Promise<any> {
    try {
      const r = await api.get<any>(`/bookings/check-availability?vehicleId=${vehicleId}&startTime=${startTime}&endTime=${endTime}`);
      return r.data.data;
    } catch { return { available: true }; }
  },
  async create(data: Partial<VehicleBooking>): Promise<VehicleBooking> {
    const r = await api.post<ApiResponse<VehicleBooking>>('/bookings', data);
    return r.data.data!;
  },
  async updateStatus(id: number, status: string): Promise<VehicleBooking> {
    const r = await api.patch<ApiResponse<VehicleBooking>>(`/bookings/${id}/status`, { status });
    return r.data.data!;
  },
  async delete(id: number): Promise<void> { await api.delete(`/bookings/${id}`); },
};
