import { create } from 'zustand';

export type Screen =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'register'
  | 'home'
  | 'booking'
  | 'selectDriver'
  | 'activeRide'
  | 'history'
  | 'profile';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Driver {
  id: string;
  name: string;
  vehicleId: string;
  plate: string;
  model: string;
  color: string;
  rating: number;
  eta: string;
  avatar: string;
  location: { latitude: number; longitude: number };
}

export interface Trip {
  id: string;
  date: string;
  driver: string;
  from: string;
  to: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  fare: number;
  duration?: string;
  rating?: number;
}

interface AppState {
  screen: Screen;
  user: User | null;
  token: string | null;
  activeTrip: Trip | null;
  selectedDriver: Driver | null;
  tripHistory: Trip[];
  destination: string;
  destinationCoords: { latitude: number; longitude: number } | null;
  userLocation: { latitude: number; longitude: number } | null;

  setScreen: (screen: Screen) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setActiveTrip: (trip: Trip | null) => void;
  setSelectedDriver: (driver: Driver | null) => void;
  setTripHistory: (trips: Trip[]) => void;
  setDestination: (dest: string) => void;
  setDestinationCoords: (coords: { latitude: number; longitude: number } | null) => void;
  setUserLocation: (loc: { latitude: number; longitude: number } | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  screen: 'splash',
  user: null,
  token: null,
  activeTrip: null,
  selectedDriver: null,
  tripHistory: [],
  destination: '',
  destinationCoords: null,
  userLocation: null,

  setScreen: (screen) => set({ screen }),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    (global as any).__peng_token = token;
    set({ token });
  },
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  setSelectedDriver: (driver) => set({ selectedDriver: driver }),
  setTripHistory: (trips) => set({ tripHistory: trips }),
  setDestination: (destination) => set({ destination }),
  setDestinationCoords: (destinationCoords) => set({ destinationCoords }),
  setUserLocation: (userLocation) => set({ userLocation }),
  logout: () => {
    (global as any).__peng_token = null;
    set({
      user: null,
      token: null,
      activeTrip: null,
      selectedDriver: null,
      screen: 'login',
    });
  },
}));
