import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_URL = 'http://26.90.192.221:3001';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  // Demo mode - backend çalışmıyorsa
  if (email === 'demo@peng.ae' && password === 'demo') {
    const demoResponse: AuthResponse = {
      user: {
        id: 'demo-1',
        email: 'demo@peng.ae',
        firstName: 'Demo',
        lastName: 'Partner',
        role: 'FLEET_MANAGER',
      },
      accessToken: 'demo-token',
      refreshToken: 'demo-refresh',
    };
    await saveTokens(demoResponse.accessToken, demoResponse.refreshToken);
    return demoResponse;
  }

  try {
    const res = await fetch(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Giriş başarısız');
    }

    const data: AuthResponse = await res.json();
    await saveTokens(data.accessToken, data.refreshToken);
    return data;
  } catch (error: any) {
    if (error.message === 'Network request failed') {
      throw new Error('Sunucuya bağlanılamıyor. Demo giriş kullanın: demo@peng.ae / demo');
    }
    throw error;
  }
}

export async function saveTokens(access: string, refresh: string) {
  await AsyncStorage.setItem('accessToken', access);
  await AsyncStorage.setItem('refreshToken', refresh);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('accessToken');
}

export async function logout() {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
  await AsyncStorage.removeItem('user');
}

export async function saveUser(user: AuthUser) {
  await AsyncStorage.setItem('user', JSON.stringify(user));
}

export async function getSavedUser(): Promise<AuthUser | null> {
  const data = await AsyncStorage.getItem('user');
  return data ? JSON.parse(data) : null;
}
