import api from './api';

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';
const PEXELS_BASE = 'https://api.pexels.com/v1';

export interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    tiny: string;
  };
  alt: string;
  photographer: string;
}

export interface PexelsSearchResult {
  photos: PexelsPhoto[];
  total_results: number;
}

const searchPhotos = async (query: string, perPage = 10): Promise<PexelsPhoto[]> => {
  if (!PEXELS_API_KEY) return [];
  try {
    const response = await fetch(`${PEXELS_BASE}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=square`, {
      headers: { Authorization: PEXELS_API_KEY },
    });
    const data: PexelsSearchResult = await response.json();
    return data.photos || [];
  } catch {
    return [];
  }
};

export const pexelsService = {
  searchPhotos,

  getDriverPhoto: async (driverName: string): Promise<string | null> => {
    const query = `professional african driver portrait ${driverName.split(' ')[0]}`;
    const photos = await searchPhotos(query, 1);
    return photos.length > 0 ? photos[0].src.medium : null;
  },

  getVehiclePhoto: async (brand: string, model: string): Promise<string | null> => {
    const query = `${brand} ${model} car vehicle`;
    const photos = await searchPhotos(query, 1);
    return photos.length > 0 ? photos[0].src.medium : null;
  },

  batchGetDriverPhotos: async (drivers: { id: number; firstName: string; lastName: string }[]): Promise<Record<number, string>> => {
    const results: Record<number, string> = {};
    const promises = drivers.map(async (driver) => {
      const photo = await pexelsService.getDriverPhoto(`${driver.firstName} ${driver.lastName}`);
      if (photo) results[driver.id] = photo;
    });
    await Promise.allSettled(promises);
    return results;
  },

  batchGetVehiclePhotos: async (vehicles: { id: number; brand: string; model: string }[]): Promise<Record<number, string>> => {
    const results: Record<number, string> = {};
    const promises = vehicles.map(async (vehicle) => {
      const photo = await pexelsService.getVehiclePhoto(vehicle.brand, vehicle.model);
      if (photo) results[vehicle.id] = photo;
    });
    await Promise.allSettled(promises);
    return results;
  },
};
