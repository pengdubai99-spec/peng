import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useStore } from '../store/useStore';

const TRACKING_URL = 'http://26.90.192.221:3005';

interface LiveViewScreenProps {
  vehicleId: string;
  onBack: () => void;
}

export default function LiveViewScreen({ vehicleId, onBack }: LiveViewScreenProps) {
  const vehicle = useStore((s) => s.vehicles[vehicleId]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Inject JS to auto-select vehicle and start watching
  const injectAutoStart = `
    (function() {
      // Wait for page to load
      const waitForReady = setInterval(() => {
        const vehicleInput = document.getElementById('vehicleId');
        const startBtn = document.querySelector('[onclick*="startWatching"]') || 
                         document.querySelector('button');
        
        if (vehicleInput) {
          vehicleInput.value = '${vehicleId}';
          vehicleInput.dispatchEvent(new Event('input'));
          clearInterval(waitForReady);
          
          // Auto-click start after a small delay
          setTimeout(() => {
            if (typeof startWatching === 'function') {
              startWatching();
            } else if (startBtn) {
              startBtn.click();
            }
          }, 1000);
        }
      }, 500);
      
      // Timeout after 10 seconds
      setTimeout(() => clearInterval(waitForReady), 10000);
    })();
    true;
  `;

  // Build the viewer URL with embedded mode parameters
  const viewerUrl = `${TRACKING_URL}/viewer.html?vehicle=${vehicleId}&autostart=1&embed=1`;

  return (
    <View style={styles.container}>
      {/* WebView with Viewer */}
      <WebView
        ref={webViewRef}
        source={{ uri: viewerUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        startInLoadingState={true}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          setLoading(false);
          // Inject auto-start script
          webViewRef.current?.injectJavaScript(injectAutoStart);
        }}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        )}
      />

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Canlı izleme yükleniyor...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>Sayfa yüklenemedi</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setError(false);
              webViewRef.current?.reload();
            }}
          >
            <Text style={styles.retryBtnText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Geri</Text>
      </TouchableOpacity>

      {/* Vehicle Info Badge */}
      <View style={styles.vehicleBadge}>
        <Text style={styles.vehiclePlate}>{vehicle?.plate || vehicleId}</Text>
        {vehicle?.speed !== undefined && (
          <Text style={styles.vehicleSpeed}>{vehicle.speed.toFixed(0)} km/s</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
  },
  webview: {
    flex: 1,
    backgroundColor: '#050510',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050510',
    gap: 12,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050510',
    gap: 12,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(99,102,241,0.15)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  retryBtnText: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: '700',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 56,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 10,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  vehicleBadge: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 56,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  vehiclePlate: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  vehicleSpeed: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
});
