import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from './src/store/useStore';
import { getSavedUser, getToken } from './src/services/auth';

import LoginScreen from './src/screens/LoginScreen';
import FleetScreen from './src/screens/FleetScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import LiveViewScreen from './src/screens/LiveViewScreen';

type Screen =
  | { name: 'login' }
  | { name: 'fleet' }
  | { name: 'tracking'; vehicleId: string }
  | { name: 'liveview'; vehicleId: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'login' });
  const [loading, setLoading] = useState(true);
  const { setUser, setToken } = useStore();

  // Kayitli oturum kontrolu
  useEffect(() => {
    (async () => {
      try {
        const [user, token] = await Promise.all([getSavedUser(), getToken()]);
        if (user && token) {
          setUser(user);
          setToken(token);
          setScreen({ name: 'fleet' });
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />

      {screen.name === 'login' && (
        <LoginScreen onLogin={() => setScreen({ name: 'fleet' })} />
      )}

      {screen.name === 'fleet' && (
        <FleetScreen
          onTrack={(vehicleId) => setScreen({ name: 'tracking', vehicleId })}
          onLiveView={(vehicleId) => setScreen({ name: 'liveview', vehicleId })}
          onLogout={() => setScreen({ name: 'login' })}
        />
      )}

      {screen.name === 'tracking' && (
        <TrackingScreen
          vehicleId={screen.vehicleId}
          onBack={() => setScreen({ name: 'fleet' })}
        />
      )}

      {screen.name === 'liveview' && (
        <LiveViewScreen
          vehicleId={screen.vehicleId}
          onBack={() => setScreen({ name: 'fleet' })}
        />
      )}
    </SafeAreaProvider>
  );
}
