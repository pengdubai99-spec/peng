import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useStore } from '../store/useStore';
import { getSocket } from '../services/socket';
import StatusDot from '../components/StatusDot';

interface TrackingScreenProps {
  vehicleId: string;
  onBack: () => void;
}

interface TrailPoint {
  latitude: number;
  longitude: number;
}

export default function TrackingScreen({ vehicleId, onBack }: TrackingScreenProps) {
  const vehicle = useStore((s) => s.vehicles[vehicleId]);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const socket = getSocket();

    const handler = (data: any) => {
      if (data.vehicleId === vehicleId) {
        const lat = data.position?.lat || data.lat;
        const lng = data.position?.lng || data.lng;
        if (lat && lng) {
          setTrail((prev) => [...prev.slice(-200), { latitude: lat, longitude: lng }]);

          mapRef.current?.animateToRegion(
            {
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            500
          );
        }
      }
    };

    socket.on('location:data', handler);
    return () => {
      socket.off('location:data', handler);
    };
  }, [vehicleId]);

  useEffect(() => {
    if (vehicle?.lat && vehicle?.lng) {
      setTrail([{ latitude: vehicle.lat, longitude: vehicle.lng }]);
    }
  }, []);

  const isOnline = vehicle && Date.now() - vehicle.lastUpdate < 30000;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: vehicle?.lat || 25.2048,
          longitude: vehicle?.lng || 55.2708,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        customMapStyle={darkMapStyle}
      >
        {vehicle?.lat && vehicle?.lng && (
          <Marker
            coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }}
            title={vehicle.plate || vehicleId}
            description={`${vehicle.speed?.toFixed(0) || 0} km/s`}
          />
        )}

        {trail.length > 1 && (
          <Polyline
            coordinates={trail}
            strokeColor="#6366f1"
            strokeWidth={3}
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Geri</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View style={styles.infoPlateRow}>
            <StatusDot status={isOnline ? 'online' : 'offline'} />
            <Text style={styles.infoPlate}>{vehicle?.plate || vehicleId}</Text>
          </View>
          {vehicle?.model && <Text style={styles.infoModel}>{vehicle.model}</Text>}
        </View>

        <View style={styles.infoStats}>
          <View style={styles.infoStatItem}>
            <Text style={styles.infoStatLabel}>HIZ</Text>
            <Text style={styles.infoStatValue}>{vehicle?.speed?.toFixed(0) || '0'} km/s</Text>
          </View>
          <View style={styles.infoStatDivider} />
          <View style={styles.infoStatItem}>
            <Text style={styles.infoStatLabel}>YON</Text>
            <Text style={styles.infoStatValue}>{vehicle?.heading?.toFixed(0) || '0'}°</Text>
          </View>
          <View style={styles.infoStatDivider} />
          <View style={styles.infoStatItem}>
            <Text style={styles.infoStatLabel}>ROTA</Text>
            <Text style={styles.infoStatValue}>{trail.length} nokta</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#161b22' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#21262d' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0f18' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
  },
  map: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    backgroundColor: 'rgba(5,5,16,0.85)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  infoCard: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(5,5,16,0.92)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoHeader: {
    marginBottom: 16,
  },
  infoPlateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoPlate: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  infoModel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  infoStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoStatLabel: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  infoStatValue: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
  },
  infoStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
