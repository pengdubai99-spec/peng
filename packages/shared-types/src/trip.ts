// ==========================================
// Trip Types
// ==========================================

export enum TripStatus {
  REQUESTED = 'REQUESTED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Trip {
  id: string;
  passengerId: string;
  driverId: string;
  vehicleId: string;
  startLocation: GeoPoint;
  endLocation?: GeoPoint;
  startAddress: string;
  endAddress?: string;
  plannedRoute?: GeoPoint[];
  actualRoute?: GeoPoint[];
  startedAt: Date;
  endedAt?: Date;
  status: TripStatus;
  fare?: number;
  shareLink?: string;
  createdAt: Date;
}

export interface CreateTripDto {
  passengerId: string;
  driverId: string;
  vehicleId: string;
  startLocation: GeoPoint;
  startAddress: string;
  endAddress?: string;
  plannedRoute?: GeoPoint[];
}

export interface Rating {
  id: string;
  tripId: string;
  ratedBy: string;
  ratedUser: string;
  score: number;
  comment?: string;
  createdAt: Date;
}
