// User & Auth
export { UserRole, type User, type CreateUserDto, type LoginDto, type AuthTokens, type AuthResponse } from './user';

// Trip
export { TripStatus, type GeoPoint, type Trip, type CreateTripDto, type Rating } from './trip';

// Vehicle, Driver, Fleet
export {
  VehicleStatus,
  DriverStatus,
  FleetPlan,
  type Vehicle,
  type Driver,
  type Fleet,
} from './vehicle';

// Location, Tracking, Video, API
export {
  GeofenceType,
  RecordingStatus,
  SocketEvents,
  type LocationUpdate,
  type Geofence,
  type VideoRecording,
  type ApiResponse,
  type PaginatedResponse,
} from './location';
