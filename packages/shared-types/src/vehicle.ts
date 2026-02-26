// ==========================================
// Vehicle Types
// ==========================================

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Vehicle {
  id: string;
  fleetId?: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  deviceSerial: string;
  status: VehicleStatus;
  deviceConfig?: Record<string, unknown>;
  createdAt: Date;
}

export enum DriverStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ON_TRIP = 'ON_TRIP',
  BREAK = 'BREAK',
}

export interface Driver {
  id: string;
  userId: string;
  vehicleId?: string;
  licenseNumber: string;
  licenseExpiry: Date;
  status: DriverStatus;
  rating: number;
  totalTrips: number;
  createdAt: Date;
}

export enum FleetPlan {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export interface Fleet {
  id: string;
  ownerId: string;
  name: string;
  taxNumber?: string;
  vehicleCount: number;
  plan: FleetPlan;
  createdAt: Date;
}
