import api from './api';
import type { ApiResponse } from '../types';

export interface Device {
  id: number;
  imei: string;
  name: string;
  protocol: string;
  firmware: string;
  signal: number;
  battery: number;
  simStatus: string;
  isOnline: boolean;
  lastPing: string | null;
  vehicleId: number | null;
  vehicle?: { id: number; plateNumber: string; brand: string; model: string } | null;
  createdAt: string;
  updatedAt: string;
}

export const deviceService = {
  async getAll(): Promise<Device[]> {
    const res = await api.get<ApiResponse<Device[]>>('/devices/manage');
    return res.data.data || [];
  },

  async getById(id: number): Promise<Device> {
    const res = await api.get<ApiResponse<Device>>(`/devices/manage/${id}`);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to fetch device');
  },

  async create(data: Partial<Device>): Promise<Device> {
    const res = await api.post<ApiResponse<Device>>('/devices/manage', data);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create device');
  },

  async update(id: number, data: Partial<Device>): Promise<Device> {
    const res = await api.put<ApiResponse<Device>>(`/devices/manage/${id}`, data);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to update device');
  },

  async delete(id: number): Promise<void> {
    const res = await api.delete<ApiResponse<void>>(`/devices/manage/${id}`);
    if (!res.data.success) throw new Error(res.data.message || 'Failed to delete device');
  },
};
