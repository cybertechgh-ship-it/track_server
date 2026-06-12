import api from './api';
import type { MaintenanceRecord } from '../types';

export const maintenanceService = {
  getByVehicle: async (vehicleId: number): Promise<MaintenanceRecord[]> => {
    const { data } = await api.get(`/maintenance/vehicle/${vehicleId}`);
    return data.data;
  },
};
