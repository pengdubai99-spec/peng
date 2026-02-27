// ==========================================
// Location & Tracking Types
// ==========================================

import { GeoPoint } from './trip';

export interface LocationUpdate {
  vehicleId: string;
  tripId?: string;
  position: GeoPoint;
  speed: number;
  heading: number;
  altitude?: number;
  recordedAt: Date;
}

export enum GeofenceType {
  RESTRICTED = 'RESTRICTED',
  ALERT = 'ALERT',
  OPERATIONAL = 'OPERATIONAL',
}

export interface Geofence {
  id: string;
  fleetId: string;
  name: string;
  boundary: GeoPoint[];
  type: GeofenceType;
  isActive: boolean;
}

// ==========================================
// Video Types
// ==========================================

export enum RecordingStatus {
  RECORDING = 'RECORDING',
  UPLOADED = 'UPLOADED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export interface VideoRecording {
  id: string;
  vehicleId: string;
  tripId?: string;
  storageUrl: string;
  durationSeconds: number;
  fileSize: number;
  status: RecordingStatus;
  startedAt: Date;
  endedAt?: Date;
  expiresAt: Date;
}

// ==========================================
// WebSocket Events
// ==========================================

export enum SocketEvents {
  LOCATION_UPDATE = 'location:update',
  LOCATION_SUBSCRIBE = 'location:subscribe',
  LOCATION_UNSUBSCRIBE = 'location:unsubscribe',
  LOCATION_DATA = 'location:data',
  ROUTE_DEVIATION = 'route:deviation',
  GEOFENCE_ALERT = 'geofence:alert',
  TRIP_STATUS_CHANGE = 'trip:status',

  // WebRTC Signaling
  WEBRTC_START_STREAM = 'webrtc:start-stream',
  WEBRTC_STOP_STREAM = 'webrtc:stop-stream',
  WEBRTC_REQUEST_STREAM = 'webrtc:request-stream',
  WEBRTC_OFFER = 'webrtc:offer',
  WEBRTC_ANSWER = 'webrtc:answer',
  WEBRTC_ICE_CANDIDATE = 'webrtc:ice-candidate',
  WEBRTC_STREAM_LIST = 'webrtc:stream-list',
}

// ==========================================
// WebRTC Signaling Types
// ==========================================

export interface WebRTCOffer {
  vehicleId: string;
  viewerId: string;
  sdp: string;
}

export interface WebRTCAnswer {
  vehicleId: string;
  viewerId: string;
  sdp: string;
}

export interface WebRTCIceCandidate {
  vehicleId: string;
  viewerId: string;
  candidate: any;
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
