import { create } from 'zustand';

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

interface Store {
  page: Page;
  user: User | null;
  token: string | null;
  destination: string;
  selectedDriver: Driver | null;
  setPage: (p: Page) => void;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  setDestination: (d: string) => void;
  setSelectedDriver: (d: Driver | null) => void;
  logout: () => void;
}

export const useStore = create<Store>((set) => ({
  page: 'home',
  user: null,
  token: null,
  destination: '',
  selectedDriver: null,
  setPage: (page) => set({ page }),
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setDestination: (destination) => set({ destination }),
  setSelectedDriver: (selectedDriver) => set({ selectedDriver }),
  logout: () => set({ user: null, token: null, page: 'home' }),
}));

export const MOCK_DRIVERS: Driver[] = [
  { id: '1', name: 'Ahmed Mansoor', avatar: 'AM', plate: '34 PEK 001', model: 'Toyota Camry', color: 'Beyaz', rating: 4.9, eta: '3 dk' },
  { id: '2', name: 'Omar Hassan', avatar: 'OH', plate: '34 PNG 042', model: 'Tesla Model 3', color: 'Siyah', rating: 4.8, eta: '5 dk' },
  { id: '3', name: 'Khalid Al-Rashid', avatar: 'KR', plate: '34 PNG 118', model: 'BMW 5 Serisi', color: 'Gri', rating: 5.0, eta: '7 dk' },
];
