import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useStore } from '../store/useStore';
import { getSocket } from '../services/socket';
import StatusDot from '../components/StatusDot';

interface TrackingScreenProps {
  vehicleId: string;
  onBack: () => void;
}

export default function TrackingScreen({ vehicleId, onBack }: TrackingScreenProps) {
  const vehicle = useStore((s) => s.vehicles[vehicleId]);
  const [trailCount, setTrailCount] = useState(0);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const socket = getSocket();

    const handler = (data: any) => {
      if (data.vehicleId === vehicleId) {
        const lat = data.position?.lat || data.lat;
        const lng = data.position?.lng || data.lng;
        if (lat && lng) {
          setTrailCount((prev) => prev + 1);
          webViewRef.current?.injectJavaScript(`
            updateMarker(${lat}, ${lng}, ${data.speed || 0});
            true;
          `);
        }
      }
    };

    socket.on('location:data', handler);
    return () => {
      socket.off('location:data', handler);
    };
  }, [vehicleId]);

  const isOnline = vehicle && Date.now() - vehicle.lastUpdate < 30000;
  const lat = vehicle?.lat || 25.2048;
  const lng = vehicle?.lng || 55.2708;

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; }
    #map { width: 100vw; height: 100vh; }
  </style>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${lat}, ${lng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    var marker = L.circleMarker([${lat}, ${lng}], {
      radius: 10,
      color: '#6366f1',
      fillColor: '#818cf8',
      fillOpacity: 1,
      weight: 3
    }).addTo(map);

    var trail = L.polyline([], { color: '#6366f1', weight: 3, opacity: 0.7 }).addTo(map);
    var trailPoints = [];

    function updateMarker(lat, lng, speed) {
      marker.setLatLng([lat, lng]);
      map.panTo([lat, lng]);
      trailPoints.push([lat, lng]);
      if (trailPoints.length > 200) trailPoints.shift();
      trail.setLatLngs(trailPoints);
    }
  <\/script>
</body>
</html>`;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
      />

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
            <Text style={styles.infoStatValue}>{trailCount} nokta</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

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
