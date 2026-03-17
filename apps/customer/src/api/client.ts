import axios from 'axios';

// Geliştirme ortamında localhost, production'da gerçek URL
const BASE_URL = __DEV__
  ? 'http://localhost:3001'  // auth-service
  : 'https://api.peng.ae';

export const AUTH_URL = __DEV__ ? 'http://localhost:3001' : 'https://api.peng.ae';
export const TRIP_URL = __DEV__ ? 'http://localhost:3002' : 'https://trip.peng.ae';
export const TRACKING_URL = __DEV__ ? 'http://localhost:3003' : 'https://tracking.peng.ae';

export const authApi = axios.create({ baseURL: AUTH_URL });
export const tripApi = axios.create({ baseURL: TRIP_URL });
export const trackingApi = axios.create({ baseURL: TRACKING_URL });

// Token interceptor - her istekte Authorization header ekle
const addAuthInterceptor = (instance: typeof authApi) => {
  instance.interceptors.request.use((config) => {
    const token = (global as any).__peng_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

addAuthInterceptor(authApi);
addAuthInterceptor(tripApi);
addAuthInterceptor(trackingApi);

// --- Auth ---
export const login = (email: string, password: string) =>
  authApi.post('/auth/login', { email, password });

export const register = (name: string, email: string, password: string, phone: string) =>
  authApi.post('/auth/register', { name, email, password, phone, role: 'PASSENGER' });

export const getProfile = () => authApi.get('/auth/profile');

// --- Trip ---
export const createTrip = (data: {
  passengerId: string;
  driverId: string;
  vehicleId: string;
  startLocation: { latitude: number; longitude: number };
  startAddress: string;
  endAddress?: string;
}) => tripApi.post('/trips', data);

export const getTrip = (id: string) => tripApi.get(`/trips/${id}`);
export const getMyTrips = () => tripApi.get('/trips/history/me');
export const completeTrip = (id: string, endLocation: { latitude: number; longitude: number }) =>
  tripApi.patch(`/trips/${id}/complete`, endLocation);

// --- Mock: Yakındaki sürücüler ---
export const MOCK_DRIVERS = [
  {
    id: 'driver-1',
    name: 'Ahmed Mansoor',
    vehicleId: 'vehicle-1',
    plate: '34 PEK 001',
    model: 'Toyota Camry',
    color: 'Beyaz',
    rating: 4.9,
    eta: '3 dk',
    avatar: 'AM',
    location: { latitude: 41.0082, longitude: 28.9784 },
  },
  {
    id: 'driver-2',
    name: 'Omar Hassan',
    vehicleId: 'vehicle-2',
    plate: '34 PNG 042',
    model: 'Tesla Model 3',
    color: 'Siyah',
    rating: 4.8,
    eta: '5 dk',
    avatar: 'OH',
    location: { latitude: 41.0095, longitude: 28.9750 },
  },
  {
    id: 'driver-3',
    name: 'Khalid Al-Rashid',
    vehicleId: 'vehicle-3',
    plate: '34 PNG 118',
    model: 'BMW 5 Serisi',
    color: 'Gri',
    rating: 5.0,
    eta: '7 dk',
    avatar: 'KR',
    location: { latitude: 41.0060, longitude: 28.9820 },
  },
];
