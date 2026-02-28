// Centralized mock data for admin panel

export interface MockVehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  fleetId: string;
  fleetName: string;
  deviceSerial: string;
  driverName?: string;
}

export interface MockDriver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'ONLINE' | 'OFFLINE' | 'ON_TRIP' | 'BREAK';
  vehicleId?: string;
  vehiclePlate?: string;
  rating: number;
  totalTrips: number;
}

export interface MockFleet {
  id: string;
  name: string;
  email: string;
  vehicleCount: number;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  accessKey: string;
  tracking: boolean;
  camera: boolean;
  status: 'Active' | 'Pending' | 'Suspended';
  trustScore: number;
  revenue: string;
}

export interface MockTrip {
  id: string;
  vehiclePlate: string;
  driverName: string;
  startAddress: string;
  endAddress: string;
  status: 'REQUESTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  fare: number;
  distance: string;
  duration: string;
  date: string;
}

export const mockVehicles: MockVehicle[] = [
  { id: '1', plateNumber: 'DXB 1234', brand: 'BYD', model: 'Atto 3', year: 2024, status: 'ACTIVE', fleetId: '1', fleetName: 'Skyline Logistics', deviceSerial: 'PENG-DXB-001', driverName: 'Ahmed Mansoor' },
  { id: '2', plateNumber: 'SHJ 9988', brand: 'BYD', model: 'Han', year: 2024, status: 'ACTIVE', fleetId: '2', fleetName: 'Desert Fleet Co', deviceSerial: 'PENG-SHJ-002', driverName: 'Sarah Al-Farsi' },
  { id: '3', plateNumber: 'AJM 5566', brand: 'Tesla', model: 'Model 3', year: 2025, status: 'MAINTENANCE', fleetId: '1', fleetName: 'Skyline Logistics', deviceSerial: 'PENG-AJM-003' },
  { id: '4', plateNumber: 'DXB 7711', brand: 'BYD', model: 'Seal', year: 2025, status: 'ACTIVE', fleetId: '3', fleetName: 'Gulf Transport LLC', deviceSerial: 'PENG-DXB-004', driverName: 'Omar Hassan' },
  { id: '5', plateNumber: 'ABD 3344', brand: 'Tesla', model: 'Model Y', year: 2024, status: 'INACTIVE', fleetId: '2', fleetName: 'Desert Fleet Co', deviceSerial: 'PENG-ABD-005' },
  { id: '6', plateNumber: 'DXB 8899', brand: 'BYD', model: 'Tang', year: 2025, status: 'ACTIVE', fleetId: '3', fleetName: 'Gulf Transport LLC', deviceSerial: 'PENG-DXB-006', driverName: 'Fatima Khalil' },
  { id: '7', plateNumber: 'RAK 2211', brand: 'BYD', model: 'Dolphin', year: 2024, status: 'ACTIVE', fleetId: '1', fleetName: 'Skyline Logistics', deviceSerial: 'PENG-RAK-007', driverName: 'Khalid Al-Rashid' },
  { id: '8', plateNumber: 'FUJ 4455', brand: 'Tesla', model: 'Model S', year: 2025, status: 'MAINTENANCE', fleetId: '2', fleetName: 'Desert Fleet Co', deviceSerial: 'PENG-FUJ-008' },
];

export const mockDrivers: MockDriver[] = [
  { id: '1', name: 'Ahmed Mansoor', email: 'ahmed@skyline.ae', phone: '+971 50 123 4567', licenseNumber: 'DXB-99221', licenseExpiry: '2027-03-15', status: 'ONLINE', vehicleId: '1', vehiclePlate: 'DXB 1234', rating: 4.8, totalTrips: 342 },
  { id: '2', name: 'Sarah Al-Farsi', email: 'sarah@desertfleet.com', phone: '+971 55 987 6543', licenseNumber: 'DIFC-88110', licenseExpiry: '2026-11-20', status: 'ON_TRIP', vehicleId: '2', vehiclePlate: 'SHJ 9988', rating: 4.9, totalTrips: 518 },
  { id: '3', name: 'Omar Hassan', email: 'omar@gulftransport.ae', phone: '+971 52 456 7890', licenseNumber: 'DXB-77334', licenseExpiry: '2027-06-01', status: 'ONLINE', vehicleId: '4', vehiclePlate: 'DXB 7711', rating: 4.6, totalTrips: 189 },
  { id: '4', name: 'Fatima Khalil', email: 'fatima@gulftransport.ae', phone: '+971 56 321 0987', licenseNumber: 'SHJ-66557', licenseExpiry: '2026-09-10', status: 'BREAK', vehicleId: '6', vehiclePlate: 'DXB 8899', rating: 4.7, totalTrips: 267 },
  { id: '5', name: 'Khalid Al-Rashid', email: 'khalid@skyline.ae', phone: '+971 50 789 1234', licenseNumber: 'AJM-55889', licenseExpiry: '2027-01-25', status: 'OFFLINE', vehicleId: '7', vehiclePlate: 'RAK 2211', rating: 4.5, totalTrips: 156 },
  { id: '6', name: 'Layla Ibrahim', email: 'layla@skyline.ae', phone: '+971 54 567 8901', licenseNumber: 'DXB-44223', licenseExpiry: '2026-08-30', status: 'ONLINE', rating: 4.4, totalTrips: 98 },
];

export const mockFleets: MockFleet[] = [
  { id: '1', name: 'Skyline Logistics', email: 'info@skyline.ae', vehicleCount: 5, plan: 'ENTERPRISE', accessKey: 'PENG-SK-2026', tracking: true, camera: true, status: 'Active', trustScore: 98, revenue: 'AED 42,800' },
  { id: '2', name: 'Desert Fleet Co', email: 'ops@desertfleet.com', vehicleCount: 12, plan: 'PRO', accessKey: 'PENG-DF-2026', tracking: true, camera: false, status: 'Active', trustScore: 85, revenue: 'AED 28,200' },
  { id: '3', name: 'Gulf Transport LLC', email: 'admin@gulftransport.ae', vehicleCount: 8, plan: 'PRO', accessKey: 'PENG-GT-2026', tracking: true, camera: true, status: 'Active', trustScore: 92, revenue: 'AED 35,600' },
  { id: '4', name: 'Emirates Mobility', email: 'info@emiratesmob.ae', vehicleCount: 3, plan: 'BASIC', accessKey: 'PENG-EM-2026', tracking: true, camera: false, status: 'Pending', trustScore: 70, revenue: 'AED 8,400' },
];

export const mockTrips: MockTrip[] = [
  { id: 'T-001', vehiclePlate: 'DXB 1234', driverName: 'Ahmed Mansoor', startAddress: 'Dubai Mall', endAddress: 'JBR Beach', status: 'COMPLETED', fare: 45, distance: '12.3 km', duration: '22 min', date: '2026-02-28' },
  { id: 'T-002', vehiclePlate: 'SHJ 9988', driverName: 'Sarah Al-Farsi', startAddress: 'Sharjah Airport', endAddress: 'Dubai Marina', status: 'ACTIVE', fare: 85, distance: '35.1 km', duration: '40 min', date: '2026-02-28' },
  { id: 'T-003', vehiclePlate: 'DXB 7711', driverName: 'Omar Hassan', startAddress: 'DIFC', endAddress: 'Palm Jumeirah', status: 'COMPLETED', fare: 55, distance: '15.8 km', duration: '25 min', date: '2026-02-28' },
  { id: 'T-004', vehiclePlate: 'DXB 8899', driverName: 'Fatima Khalil', startAddress: 'Dubai Airport T3', endAddress: 'Downtown Dubai', status: 'COMPLETED', fare: 35, distance: '8.5 km', duration: '15 min', date: '2026-02-28' },
  { id: 'T-005', vehiclePlate: 'RAK 2211', driverName: 'Khalid Al-Rashid', startAddress: 'Ras Al Khaimah', endAddress: 'Fujairah', status: 'CANCELLED', fare: 120, distance: '85 km', duration: '70 min', date: '2026-02-27' },
  { id: 'T-006', vehiclePlate: 'DXB 1234', driverName: 'Ahmed Mansoor', startAddress: 'Business Bay', endAddress: 'Al Quoz', status: 'COMPLETED', fare: 28, distance: '6.2 km', duration: '12 min', date: '2026-02-27' },
  { id: 'T-007', vehiclePlate: 'SHJ 9988', driverName: 'Sarah Al-Farsi', startAddress: 'Al Nahda', endAddress: 'Burj Khalifa', status: 'COMPLETED', fare: 65, distance: '22.4 km', duration: '30 min', date: '2026-02-27' },
  { id: 'T-008', vehiclePlate: 'DXB 7711', driverName: 'Omar Hassan', startAddress: 'Deira City Centre', endAddress: 'Motor City', status: 'REQUESTED', fare: 50, distance: '18 km', duration: '28 min', date: '2026-02-28' },
];

export const mockRecentActivity = [
  { id: 1, type: 'trip_complete', message: 'Trip T-001 completed by Ahmed Mansoor', time: '2 min ago', icon: 'check' },
  { id: 2, type: 'driver_online', message: 'Omar Hassan went online', time: '5 min ago', icon: 'user' },
  { id: 3, type: 'alert', message: 'Vehicle DXB 8899 entered geofence zone', time: '12 min ago', icon: 'alert' },
  { id: 4, type: 'vehicle_added', message: 'New vehicle RAK 2211 registered', time: '1 hour ago', icon: 'car' },
  { id: 5, type: 'trip_complete', message: 'Trip T-004 completed by Fatima Khalil', time: '2 hours ago', icon: 'check' },
  { id: 6, type: 'partner_joined', message: 'Emirates Mobility joined as partner', time: '3 hours ago', icon: 'partner' },
];
