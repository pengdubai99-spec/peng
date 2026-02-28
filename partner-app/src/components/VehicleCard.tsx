import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StatusDot from './StatusDot';
import { VehicleLocation } from '../store/useStore';

interface VehicleCardProps {
  vehicle: VehicleLocation;
  isStreaming: boolean;
  onTrack: () => void;
  onLiveView: () => void;
}

export default function VehicleCard({ vehicle, isStreaming, onTrack, onLiveView }: VehicleCardProps) {
  const timeSince = () => {
    const diff = Date.now() - vehicle.lastUpdate;
    if (diff < 60000) return `${Math.floor(diff / 1000)}s önce`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}dk önce`;
    return 'Çevrimdışı';
  };

  const isOnline = Date.now() - vehicle.lastUpdate < 30000;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.plateContainer}>
          <StatusDot status={isStreaming ? 'streaming' : isOnline ? 'online' : 'offline'} />
          <Text style={styles.plate}>{vehicle.plate || vehicle.vehicleId}</Text>
        </View>
        <Text style={styles.time}>{timeSince()}</Text>
      </View>

      {vehicle.model && (
        <Text style={styles.model}>{vehicle.model}</Text>
      )}

      <View style={styles.info}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Hız</Text>
          <Text style={styles.infoValue}>{vehicle.speed?.toFixed(0) || '0'} km/s</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Konum</Text>
          <Text style={styles.infoValue}>
            {vehicle.lat?.toFixed(4)}, {vehicle.lng?.toFixed(4)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.trackBtn} onPress={onTrack}>
          <Text style={styles.trackBtnText}>📍 Haritada Takip Et</Text>
        </TouchableOpacity>
        {isStreaming && (
          <TouchableOpacity style={styles.liveBtn} onPress={onLiveView}>
            <Text style={styles.liveBtnText}>🎥 Canlı İzle</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plate: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  time: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
  },
  model: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  info: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 14,
  },
  infoItem: {},
  infoLabel: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 2,
  },
  infoValue: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  trackBtn: {
    flex: 1,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  trackBtnText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700',
  },
  liveBtn: {
    flex: 1,
    backgroundColor: 'rgba(236,72,153,0.12)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.2)',
  },
  liveBtnText: {
    color: '#f472b6',
    fontSize: 12,
    fontWeight: '700',
  },
});
