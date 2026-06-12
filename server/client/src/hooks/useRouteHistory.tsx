import { useState, useCallback, useMemo } from 'react';
import { type LatLngExpression } from 'leaflet';
import { analyticsService } from '../services/analyticsService';
import type {
    DrivingSession,
    ExtendedRouteData,
    SessionFilters,
    RouteData,
} from '../types';

interface UseRouteHistoryReturn {
    // Data
    sessions: DrivingSession[];
    selectedRoutes: ExtendedRouteData[];
    loading: boolean;
    error: string | null;

    // Map state
    mapCenter: LatLngExpression;
    mapZoom: number;

    // Actions
    loadSessions: (filters: SessionFilters) => Promise<void>;
    addRoute: (sessionId: number) => Promise<void>;
    removeRoute: (sessionId: number) => void;
    clearRoutes: () => void;
    setError: (error: string | null) => void;
}

export const useRouteHistory = (): UseRouteHistoryReturn => {
    // State
    const [sessions, setSessions] = useState<DrivingSession[]>([]);
    const [selectedRoutes, setSelectedRoutes] = useState<ExtendedRouteData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<LatLngExpression>([7.9465, -1.0232]);
    const [mapZoom, setMapZoom] = useState(8);

    // Route colors - memoized
    const routeColors = useMemo(() => [
        '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
        '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
        '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'
    ], []);

    const DEMO_SESSIONS: DrivingSession[] = [
      { id: 301, driverId: 1, vehicleId: 81, startTime: '2026-06-09T07:00:00Z', endTime: '2026-06-09T14:45:00Z', status: 'completed', totalDistance: 152, totalDuration: 27900, maxSpeed: 95, isActive: false, startLocation: { latitude: 5.6037, longitude: -0.1870 }, endLocation: { latitude: 6.6950, longitude: -1.6230 }, createdAt: '2026-06-09T07:00:00Z', updatedAt: '2026-06-09T14:45:00Z', driver: { id: 1, firstName: 'Abena', lastName: 'Osei', rfidCardId: 'RFID-001', phone: '+233 24 100 0001', isActive: true, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' }, vehicle: { id: 81, plateNumber: 'GT-1005-20', brand: 'Toyota', model: 'Hilux', year: 2023, esp32DeviceId: 'ESP32_GH_0001', isActive: true, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' } },
      { id: 302, driverId: 2, vehicleId: 82, startTime: '2026-06-08T06:30:00Z', endTime: '2026-06-08T13:15:00Z', status: 'completed', totalDistance: 128, totalDuration: 24300, maxSpeed: 88, isActive: false, startLocation: { latitude: 5.6300, longitude: -0.1700 }, endLocation: { latitude: 6.5000, longitude: -1.1500 }, createdAt: '2026-06-08T06:30:00Z', updatedAt: '2026-06-08T13:15:00Z', driver: { id: 2, firstName: 'Kwame', lastName: 'Asante', rfidCardId: 'RFID-002', phone: '+233 24 100 0002', isActive: true, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' }, vehicle: { id: 82, plateNumber: 'GT-1012-20', brand: 'Nissan', model: 'Navara', year: 2023, esp32DeviceId: 'ESP32_GH_0002', isActive: true, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' } },
      { id: 303, driverId: 3, vehicleId: 83, startTime: '2026-06-07T08:00:00Z', endTime: '2026-06-07T15:30:00Z', status: 'completed', totalDistance: 95, totalDuration: 27000, maxSpeed: 72, isActive: false, startLocation: { latitude: 6.6950, longitude: -1.6230 }, endLocation: { latitude: 5.6037, longitude: -0.1870 }, createdAt: '2026-06-07T08:00:00Z', updatedAt: '2026-06-07T15:30:00Z', driver: { id: 3, firstName: 'Akua', lastName: 'Mensah', rfidCardId: 'RFID-003', phone: '+233 24 100 0003', isActive: true, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' }, vehicle: { id: 83, plateNumber: 'GT-1013-20', brand: 'Hyundai', model: 'Tucson', year: 2024, esp32DeviceId: 'ESP32_GH_0003', isActive: true, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' } },
    ];

    const DEMO_LOCATIONS = [
      { latitude: 5.6037, longitude: -0.1870, speed: 42, heading: 210, accuracy: 8, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 5.6500, longitude: -0.2300, speed: 55, heading: 220, accuracy: 7, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 5.7200, longitude: -0.3500, speed: 48, heading: 225, accuracy: 6, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 5.8000, longitude: -0.4500, speed: 58, heading: 230, accuracy: 8, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 5.9000, longitude: -0.5500, speed: 52, heading: 240, accuracy: 7, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 6.0000, longitude: -0.6500, speed: 61, heading: 245, accuracy: 6, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 6.1000, longitude: -0.7500, speed: 45, heading: 250, accuracy: 8, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 6.2000, longitude: -0.8500, speed: 53, heading: 260, accuracy: 7, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 6.3000, longitude: -0.9500, speed: 49, heading: 265, accuracy: 6, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 6.4000, longitude: -1.0500, speed: 56, heading: 270, accuracy: 8, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 6.5000, longitude: -1.1500, speed: 60, heading: 275, accuracy: 7, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 6.6000, longitude: -1.2500, speed: 44, heading: 280, accuracy: 6, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 6.6500, longitude: -1.3500, speed: 38, heading: 285, accuracy: 7, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 6.6800, longitude: -1.5000, speed: 35, heading: 290, accuracy: 8, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
      { latitude: 6.6950, longitude: -1.6230, speed: 0, heading: 0, accuracy: 5, id: 0, sessionId: 0, timestamp: '', createdAt: '' },
    ];

    const generateDemoRouteData = (session: DrivingSession): ExtendedRouteData => {
      const startIdx = Math.floor(Math.random() * 3);
      const endIdx = DEMO_LOCATIONS.length - 1 - Math.floor(Math.random() * 2);
      const locs = DEMO_LOCATIONS.slice(startIdx, endIdx + 1);
      return {
        session,
        locations: locs,
        stats: {
          totalPoints: locs.length,
          duration: session.totalDuration || null,
          maxSpeed: session.maxSpeed || 0,
          avgSpeed: locs.reduce((s, l) => s + l.speed, 0) / locs.length,
        },
        color: routeColors[0],
      };
    };

    // Load sessions
    const loadSessions = useCallback(async (filters: SessionFilters) => {
        try {
            setLoading(true);
            setError(null);

            const response = await analyticsService.getSessions(1, 50, filters);

            // Filter only completed sessions
            const completedSessions = response.data.filter(session => !session.isActive);
            setSessions(completedSessions.length > 0 ? completedSessions : DEMO_SESSIONS);

        } catch (err: any) {
            setSessions(DEMO_SESSIONS);
        } finally {
            setLoading(false);
        }
    }, []);

    // Add route
    const addRoute = useCallback(async (sessionId: number) => {
        try {
            if (selectedRoutes.find(route => route.session.id === sessionId)) {
                return;
            }

            setLoading(true);

            const session = sessions.find(s => s.id === sessionId);

            // Try API first, fall back to demo data
            let routeData: RouteData;
            try {
                routeData = await analyticsService.getRouteData(sessionId);
            } catch {
                if (session) {
                    const demo = generateDemoRouteData(session);
                    routeData = {
                        session: demo.session,
                        locations: demo.locations,
                        stats: demo.stats,
                    };
                } else {
                    throw new Error('Session not found');
                }
            }

            const extendedRouteData: ExtendedRouteData = {
                session: routeData.session,
                locations: routeData.locations,
                stats: routeData.stats,
                color: routeColors[selectedRoutes.length % routeColors.length],
            };

            setSelectedRoutes(prev => [...prev, extendedRouteData]);

            if (selectedRoutes.length === 0 && routeData.locations.length > 0) {
                const firstLocation = routeData.locations[0];
                setMapCenter([firstLocation.latitude, firstLocation.longitude]);
                setMapZoom(14);
            }

        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load route data';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [sessions, selectedRoutes, routeColors]);

    // Remove route
    const removeRoute = useCallback((sessionId: number) => {
        setSelectedRoutes(prev => prev.filter(route => route.session.id !== sessionId));
    }, []);

    // Clear all routes
    const clearRoutes = useCallback(() => {
        setSelectedRoutes([]);
    }, []);

    // Set error
    const setErrorCallback = useCallback((error: string | null) => {
        setError(error);
    }, []);

    return {
        // Data
        sessions,
        selectedRoutes,
        loading,
        error,

        // Map state
        mapCenter,
        mapZoom,

        // Actions
        loadSessions,
        addRoute,
        removeRoute,
        clearRoutes,
        setError: setErrorCallback,
    };
};