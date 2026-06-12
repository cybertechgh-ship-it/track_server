export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: number;
  rfidCardId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  photo?: string;
  isActive: boolean;
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseDoc?: string;
  behaviorScore?: number;
  totalTrips?: number;
  totalDistance?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: number;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  esp32DeviceId: string;
  photo?: string;
  isActive: boolean;
  color?: string;
  speedLimit?: number;
  totalOdometer?: number;
  lastServiceOdometer?: number;
  serviceIntervalKm?: number;
  registrationDate?: string;
  registrationDoc?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: number;
  vehicleId: number;
  type: "oil_change" | "tire" | "brake" | "service" | "inspection" | "fuel" | "other";
  description: string;
  cost: number;
  odometer: number;
  performedAt: string;
  nextDueDate: string | null;
  nextDueOdometer: number | null;
  performedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
}

export interface DrivingSession {
  id: number;
  driverId: number;
  vehicleId: number;
  startTime: string;
  endTime?: string;
  startLocation: any;
  endLocation?: any;
  totalDistance: number;
  totalDuration?: number;
  maxSpeed?: number;
  status?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  driver?: Driver;
  vehicle?: Vehicle;
}

export interface LocationLog {
  id: number;
  sessionId: number;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  timestamp: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  meta?: ApiMeta;
}

export interface ApiMeta {
  pagination?: PaginationMeta;
  total?: number;
  timestamp?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface DashboardStats {
  summary: {
    totalDrivers: number;
    totalVehicles: number;
    activeSessions: number;
    totalSessions: number;
    totalDistance: number;
    avgDistance: number;
  };
  topDrivers: TopDriver[];
  topVehicles: TopVehicle[];
}

export interface TopDriver {
  driverId: number;
  sessionCount: number;
  totalDistance: number;
  firstName: string;
  lastName: string;
}

export interface TopVehicle {
  vehicleId: number;
  sessionCount: number;
  totalDistance: number;
  plateNumber: string;
  brand: string;
  model: string;
}

export interface DailyStats {
  date: string;
  sessionCount: number;
  totalDistance: number;
  uniqueDrivers: number;
  uniqueVehicles: number;
}

export interface RouteData {
  session: DrivingSession;
  locations: LocationLog[];
  stats: RouteStats;
}

export interface RouteStats {
  totalPoints: number;
  duration: number | null;
  maxSpeed: number;
  avgSpeed: number;
}

export interface ExtendedRouteData extends RouteData {
  color: string;
}

export interface SessionFilters {
  driverId?: number;
  vehicleId?: number;
  startDate?: string;
  endDate?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LiveVehicleData extends DrivingSession {
  currentLocation?: LocationLog;
  lastUpdate?: string;
}