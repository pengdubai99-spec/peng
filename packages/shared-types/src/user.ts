// ==========================================
// User Types
// ==========================================

export enum UserRole {
  PASSENGER = 'PASSENGER',
  DRIVER = 'DRIVER',
  FLEET_MANAGER = 'FLEET_MANAGER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  preferences?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: Omit<User, 'preferences'>;
  tokens: AuthTokens;
}
