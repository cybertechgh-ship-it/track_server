import api from './api';

export const uploadService = {
  async vehicleImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/upload/vehicle', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.url;
  },

  async driverImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/upload/driver', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.url;
  },
};
