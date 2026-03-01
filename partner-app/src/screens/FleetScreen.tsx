import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useStore, VehicleLocation } from '../store/useStore';
import { connectSocket, disconnectSocket } from '../services/socket';
import { logout } from '../services/auth';
import VehicleCard from '../components/VehicleCard';
import StatusDot from '../components/StatusDot';

interface FleetScreenProps {
  onTrack: (vehicleId: string) => void;
  onLiveView: (vehicleId: string) => void;
  onLogout: () => void;
}

export default function FleetScreen({ onTrack, onLiveView, onLogout }: FleetScreenProps) {
  const {
    user,
    vehicles,
    updateVehicle,
    activeStreams,
    setActiveStreams,
    isConnected,
    setConnected,
    setSelectedVehicleId,
    setUser,
    setToken,
    clearVehicles,
  } = useStore();

  useEffect(() => {
    const socket = connectSocket();

    socket.on('connect', () => {
      setConnected(true);
      // Tüm araçların konumlarını dinle
      socket.emit('location:subscribe', { fleetId: 'global' });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('location:data', (data: any) => {
      updateVehicle(data.vehicleId, {
        lat: data.position?.lat || data.lat,
        lng: data.position?.lng || data.lng,
        speed: data.speed || 0,
        heading: data.heading || 0,
        plate: data.plate || data.vehicleId,
        model: data.model,
      });
    });

    socket.on('webrtc:stream-list', (data: any) => {
      const streams = data.activeStreams || data.streams || [];
      setActiveStreams(streams.map((s: any) => s.vehicleId || s));
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  const vehicleList = Object.values(vehicles).sort(
    (a, b) => b.lastUpdate - a.lastUpdate
  );

  const onlineCount = vehicleList.filter(
    (v) => Date.now() - v.lastUpdate < 30000
  ).length;

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    clearVehicles();
    disconnectSocket();
    onLogout();
  };

  const handleTrack = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    onTrack(vehicleId);
  };

  const handleLiveView = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    onLiveView(vehicleId);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>
          Merhaba, {user?.firstName || 'Partner'} 👋
        </Text>
        <View style={styles.statusRow}>
          <StatusDot status={isConnected ? 'online' : 'offline'} size={8} />
          <Text style={styles.statusText}>
            {isConnected ? 'Bağlı' : 'Bağlantı yok'}
          </Text>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.countText}>
            {onlineCount}/{vehicleList.length} araç aktif
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🚗</Text>
      <Text style={styles.emptyTitle}>Henüz araç verisi yok</Text>
      <Text style={styles.emptyDesc}>
        {isConnected
          ? 'Araçlar bağlandığında burada görünecek.'
          : 'Tracking servisine bağlanılıyor...'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.glowTop} />

      {renderHeader()}

      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Filom</Text>
        <Text style={styles.badge}>{vehicleList.length} ARAÇ</Text>
      </View>

      <FlatList
        data={vehicleList}
        keyExtractor={(item) => item.vehicleId}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            isStreaming={activeStreams.includes(item.vehicleId)}
            onTrack={() => handleTrack(item.vehicleId)}
            onLiveView={() => handleLiveView(item.vehicleId)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
  },
  glowTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99,102,241,0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  greeting: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  separator: {
    color: '#334155',
    fontSize: 11,
  },
  countText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  logoutText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: 'rgba(99,102,241,0.12)',
    color: '#818cf8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
