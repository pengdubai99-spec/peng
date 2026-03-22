import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Page = 'home' | 'login' | 'register' | 'book' | 'tracking' | 'history' | 'profile';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  plate: string;
  model: string;
  color: string;
  rating: number;
  eta: string;
}

export interface Trip {
  id: string;
  status: string;
  driverId: string;
  startAddress: string;
  endAddress?: string;
  fare?: number;
  demo?: boolean;
}

interface Store {
  page: Page;
  user: User | null;
  token: string | null;
  destination: string;
  selectedDriver: Driver | null;
  activeTrip: Trip | null;
  setPage: (p: Page) => void;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  setDestination: (d: string) => void;
  setSelectedDriver: (d: Driver | null) => void;
  setActiveTrip: (t: Trip | null) => void;
  logout: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      page: 'home',
      user: null,
      token: null,
      destination: '',
      selectedDriver: null,
      activeTrip: null,
      setPage: (page) => set({ page }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setDestination: (destination) => set({ destination }),
      setSelectedDriver: (selectedDriver) => set({ selectedDriver }),
      setActiveTrip: (activeTrip) => set({ activeTrip }),
      logout: () => set({ user: null, token: null, page: 'home', activeTrip: null }),
    }),
    { name: 'peng-storage' }
  )
);

// API helpers
export async function apiLogin(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Giriş başarısız.');
  }
  return res.json();
}

export async function apiRegister(data: {
  firstName: string; lastName: string; email: string; phone: string; password: string;
}) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Kayıt başarısız.');
  }
  return res.json();
}

export async function apiGetNearbyDrivers(): Promise<Driver[]> {
  try {
    const res = await fetch('/api/drivers/nearby');
    const data = await res.json();
    return data.drivers || FALLBACK_DRIVERS;
  } catch {
    return FALLBACK_DRIVERS;
  }
}

export async function apiCreateTrip(
  token: string | null,
  driverId: string,
  startAddress: string,
  endAddress: string,
  fare: number
): Promise<Trip> {
  const res = await fetch('/api/trips', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ driverId, startAddress, endAddress, fare }),
  });
  if (!res.ok) throw new Error('Yolculuk başlatılamadı.');
  const data = await res.json();
  return data.trip;
}

export async function apiCompleteTrip(token: string | null, tripId: string) {
  await fetch(`/api/trips/${tripId}/complete`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function apiRateTrip(token: string | null, tripId: string, score: number, comment?: string) {
  await fetch(`/api/trips/${tripId}/rate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ score, comment }),
  });
}

export async function apiGetHistory(token: string | null) {
  if (!token) return [];
  try {
    const res = await fetch('/api/trips/history', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.trips || [];
  } catch {
    return [];
  }
}

export const FALLBACK_DRIVERS: Driver[] = [
  { id: 'demo-1', name: 'Ahmed Mansoor', avatar: 'AM', plate: '34 PEK 001', model: 'Toyota Camry', color: 'Beyaz', rating: 4.9, eta: '3 dk' },
  { id: 'demo-2', name: 'Omar Hassan', avatar: 'OH', plate: '34 PNG 042', model: 'Tesla Model 3', color: 'Siyah', rating: 4.8, eta: '5 dk' },
  { id: 'demo-3', name: 'Khalid Al-Rashid', avatar: 'KR', plate: '34 PNG 118', model: 'BMW 5 Serisi', color: 'Gri', rating: 5.0, eta: '7 dk' },
];
