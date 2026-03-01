import { create } from 'zustand';
import { AuthUser } from '../services/auth';

export interface VehicleLocation {
  vehicleId: string;
  plate?: string;
  model?: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  lastUpdate: number;
  isStreaming?: boolean;
}

interface AppState {
  // Auth
  user: AuthUser | null;
  token: string | null;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;

  // Vehicles
  vehicles: Record<string, VehicleLocation>;
  updateVehicle: (vehicleId: string, data: Partial<VehicleLocation>) => void;
  clearVehicles: () => void;

  // Active streams
  activeStreams: string[];
  setActiveStreams: (streams: string[]) => void;

  // Selected vehicle
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;

  // Connection
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // Auth
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  // Vehicles
  vehicles: {},
  updateVehicle: (vehicleId, data) =>
    set((state) => {
      const existing = state.vehicles[vehicleId];
      const defaults: VehicleLocation = {
        vehicleId,
        lat: 0,
        lng: 0,
        speed: 0,
        heading: 0,
        lastUpdate: Date.now(),
      };
      return {
        vehicles: {
          ...state.vehicles,
          [vehicleId]: {
            ...defaults,
            ...existing,
            ...data,
            lastUpdate: Date.now(),
          },
        },
      };
    }),
  clearVehicles: () => set({ vehicles: {} }),

  // Active streams
  activeStreams: [],
  setActiveStreams: (streams) => set({ activeStreams: streams }),

  // Selected vehicle
  selectedVehicleId: null,
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),

  // Connection
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),
}));
