import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';
import { io, Socket } from 'socket.io-client';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';

const { width } = Dimensions.get('window');

// ==========================================
// ICE SERVERS (Google STUN - Ucretsiz)
// ==========================================
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

// ==========================================
// SOCKET EVENTS (shared-types ile ayni)
// ==========================================
const SocketEvents = {
  LOCATION_UPDATE: 'location:update',
  LOCATION_SUBSCRIBE: 'location:subscribe',
  LOCATION_DATA: 'location:data',
  WEBRTC_START_STREAM: 'webrtc:start-stream',
  WEBRTC_STOP_STREAM: 'webrtc:stop-stream',
  WEBRTC_REQUEST_STREAM: 'webrtc:request-stream',
  WEBRTC_OFFER: 'webrtc:offer',
  WEBRTC_ANSWER: 'webrtc:answer',
  WEBRTC_ICE_CANDIDATE: 'webrtc:ice-candidate',
  WEBRTC_STREAM_LIST: 'webrtc:stream-list',
} as const;

// ==========================================
// MAIN APP
// ==========================================
export default function App() {
  // Settings
  const [serverIp, setServerIp] = useState('192.168.1.15');
  const [serverPort, setServerPort] = useState('3003');
  const [vehicleId, setVehicleId] = useState('DXB-BYD-01');
  const [vehiclePlate, setVehiclePlate] = useState('DXB 1234');
  const [vehicleModel, setVehicleModel] = useState('BYD ATTO 3');
  const [showSettings, setShowSettings] = useState(false);

  // State
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectedViewers, setConnectedViewers] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
  const [gpsCount, setGpsCount] = useState(0);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const wsUrl = `http://${serverIp}:${serverPort}`;

  // ==========================================
  // LOGGING
  // ==========================================
  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev.slice(0, 19)]);
  }, []);

  // ==========================================
  // WebRTC: Peer olustur
  // ==========================================
  const createPeerForViewer = useCallback(async (viewerId: string) => {
    if (!localStreamRef.current || !socketRef.current) return;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    localStreamRef.current.getTracks().forEach((track: any) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    pc.onicecandidate = (event: any) => {
      if (event.candidate) {
        socketRef.current?.emit(SocketEvents.WEBRTC_ICE_CANDIDATE, {
          vehicleId,
          viewerId,
          candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = (pc as any).connectionState;
      addLog(`Izleyici ${viewerId.slice(-4)}: ${state}`);
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        peerConnectionsRef.current.delete(viewerId);
        setConnectedViewers(peerConnectionsRef.current.size);
      }
    };

    const offer = await pc.createOffer({});
    await pc.setLocalDescription(offer);

    socketRef.current.emit(SocketEvents.WEBRTC_OFFER, {
      vehicleId,
      viewerId,
      sdp: (offer as any).sdp,
    });

    peerConnectionsRef.current.set(viewerId, pc);
    setConnectedViewers(peerConnectionsRef.current.size);
    addLog(`Offer gonderildi → ${viewerId.slice(-4)}`);
  }, [addLog, vehicleId]);

  // ==========================================
  // WebRTC: Stream baslat/durdur
  // ==========================================
  const startWebRTCStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing === 'back' ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 15 },
        },
        audio: false,
      });

      localStreamRef.current = stream as MediaStream;
      socketRef.current?.emit(SocketEvents.WEBRTC_START_STREAM, { vehicleId });
      setIsStreaming(true);
      addLog('WebRTC yayin baslatildi');
    } catch (e: any) {
      addLog(`Kamera hatasi: ${e.message}`);
    }
  };

  const stopWebRTCStream = () => {
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    setConnectedViewers(0);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track: any) => track.stop());
      localStreamRef.current = null;
    }

    socketRef.current?.emit(SocketEvents.WEBRTC_STOP_STREAM, { vehicleId });
    setIsStreaming(false);
    addLog('WebRTC yayin durduruldu');
  };

  // ==========================================
  // Socket.IO
  // ==========================================
  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 3000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      addLog(`Sunucuya baglandi (${wsUrl})`);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      addLog('Baglanti kesildi');
    });

    socket.on('connect_error', (err) => {
      addLog(`Baglanti hatasi: ${err.message}`);
    });

    // WebRTC: Izleyici stream istegi
    socket.on(SocketEvents.WEBRTC_REQUEST_STREAM, (data: { vehicleId: string; viewerId: string }) => {
      if (data.vehicleId === vehicleId) {
        addLog(`Izleyici baglaniyor: ${data.viewerId.slice(-4)}`);
        createPeerForViewer(data.viewerId);
      }
    });

    // WebRTC: Answer
    socket.on(SocketEvents.WEBRTC_ANSWER, async (data: { viewerId: string; sdp: string }) => {
      const pc = peerConnectionsRef.current.get(data.viewerId);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
          addLog(`Answer alindi ← ${data.viewerId.slice(-4)}`);
        } catch (e: any) {
          addLog(`Answer hatasi: ${e.message}`);
        }
      }
    });

    // WebRTC: ICE Candidate
    socket.on(SocketEvents.WEBRTC_ICE_CANDIDATE, async (data: { viewerId: string; candidate: any }) => {
      const pc = peerConnectionsRef.current.get(data.viewerId);
      if (pc && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          // ICE hatasi - genellikle onemli degil
        }
      }
    });
  }, [wsUrl, vehicleId, addLog, createPeerForViewer]);

  const disconnectSocket = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  };

  // ==========================================
  // Sistem Ac/Kapat
  // ==========================================
  const toggleDuty = async () => {
    if (isOnline) {
      // KAPAT
      locationSubRef.current?.remove();
      locationSubRef.current = null;
      stopWebRTCStream();
      disconnectSocket();
      setIsOnline(false);
      setGpsCount(0);
      addLog('Sistem kapatildi');
    } else {
      // AC
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        Alert.alert('Hata', 'Konum izni gereklidir');
        return;
      }

      const camStatus = await requestPermission();
      if (!camStatus?.granted) {
        Alert.alert('Hata', 'Kamera izni gereklidir');
        return;
      }

      setIsOnline(true);
      addLog('Sistem aktif edildi');

      // Socket bagla
      connectSocket();

      // GPS basla
      locationSubRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 3,
        },
        (loc) => {
          setLocation(loc);
          setSpeed(Math.max(0, (loc.coords.speed || 0) * 3.6)); // m/s -> km/h
          setHeading(loc.coords.heading || 0);
          setGpsCount(prev => prev + 1);

          socketRef.current?.emit(SocketEvents.LOCATION_UPDATE, {
            vehicleId,
            position: { lat: loc.coords.latitude, lng: loc.coords.longitude },
            speed: loc.coords.speed || 0,
            heading: loc.coords.heading || 0,
            altitude: loc.coords.altitude || 0,
            recordedAt: new Date().toISOString(),
          });
        }
      );

      // WebRTC basla (kisa gecikme ile socket'in baglanmasini bekle)
      setTimeout(() => startWebRTCStream(), 1500);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      locationSubRef.current?.remove();
      socketRef.current?.disconnect();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track: any) => track.stop());
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
    };
  }, []);

  // ==========================================
  // SETTINGS MODAL
  // ==========================================
  const renderSettings = () => (
    <Modal visible={showSettings} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>AYARLAR</Text>

          <Text style={styles.inputLabel}>Sunucu IP Adresi</Text>
          <TextInput
            style={styles.input}
            value={serverIp}
            onChangeText={setServerIp}
            placeholder="192.168.1.15"
            placeholderTextColor="#4b5563"
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Sunucu Port</Text>
          <TextInput
            style={styles.input}
            value={serverPort}
            onChangeText={setServerPort}
            placeholder="3003"
            placeholderTextColor="#4b5563"
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Arac ID</Text>
          <TextInput
            style={styles.input}
            value={vehicleId}
            onChangeText={setVehicleId}
            placeholder="DXB-BYD-01"
            placeholderTextColor="#4b5563"
          />

          <Text style={styles.inputLabel}>Plaka</Text>
          <TextInput
            style={styles.input}
            value={vehiclePlate}
            onChangeText={setVehiclePlate}
            placeholder="DXB 1234"
            placeholderTextColor="#4b5563"
          />

          <Text style={styles.inputLabel}>Arac Modeli</Text>
          <TextInput
            style={styles.input}
            value={vehicleModel}
            onChangeText={setVehicleModel}
            placeholder="BYD ATTO 3"
            placeholderTextColor="#4b5563"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnSave]}
              onPress={() => {
                setShowSettings(false);
                addLog(`Ayarlar kaydedildi: ${serverIp}:${serverPort}`);
              }}
            >
              <Text style={styles.modalBtnText}>KAYDET</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.deviceInfo}>
            {Device.modelName || 'Bilinmeyen Cihaz'} | {Platform.OS} {Platform.Version}
          </Text>
        </View>
      </View>
    </Modal>
  );

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050510" />

      {renderSettings()}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoDot, isConnected && styles.logoDotActive]} />
          <Text style={styles.logoText}>CANTAK</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => setShowSettings(true)}
            disabled={isOnline}
          >
            <Text style={styles.settingsBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Durum Karti */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusLabel}>SISTEM DURUMU</Text>
            <Text style={[styles.statusValue, { color: isOnline ? '#10b981' : '#ef4444' }]}>
              {isOnline ? 'AKTIF' : 'KAPALI'}
            </Text>
            {isOnline && (
              <View style={styles.statusDetails}>
                <Text style={styles.statusDetail}>
                  {isConnected ? '● Sunucu bagli' : '○ Sunucu baglaniyor...'}
                </Text>
                <Text style={styles.statusDetail}>
                  {isStreaming ? '● WebRTC yayin aktif' : '○ Yayin hazırlaniyor...'}
                </Text>
                {connectedViewers > 0 && (
                  <Text style={[styles.statusDetail, { color: '#6366f1' }]}>
                    ● {connectedViewers} izleyici bagli
                  </Text>
                )}
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.powerBtn, isOnline && styles.powerBtnActive]}
            onPress={toggleDuty}
          >
            <Text style={styles.powerIcon}>{isOnline ? '⏻' : '⏻'}</Text>
          </TouchableOpacity>
        </View>

        {/* Kamera Goruntusu */}
        <View style={styles.cameraContainer}>
          {isOnline ? (
            <CameraView style={styles.camera} facing={cameraFacing}>
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraTopRow}>
                  <View style={[styles.liveBadge, isStreaming && styles.liveBadgeActive]}>
                    <View style={[styles.liveDot, isStreaming && styles.liveDotActive]} />
                    <Text style={styles.liveText}>
                      {isStreaming ? 'CANLI' : 'KAMERA'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.flipBtn}
                    onPress={() => setCameraFacing(prev => prev === 'back' ? 'front' : 'back')}
                  >
                    <Text style={styles.flipBtnText}>↻</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cameraBottomRow}>
                  <View style={styles.camInfoBox}>
                    <Text style={styles.camText}>{vehiclePlate} - {vehicleModel}</Text>
                    <Text style={styles.camSubText}>{vehicleId}</Text>
                  </View>
                </View>
              </View>
            </CameraView>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.placeholderIcon}>📹</Text>
              <Text style={styles.placeholderText}>Sistemi aktif edin</Text>
              <Text style={styles.placeholderSub}>{wsUrl}</Text>
            </View>
          )}
        </View>

        {/* Bilgi Grid */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>📍</Text>
            <Text style={styles.gridLabel}>KONUM</Text>
            <Text style={styles.gridValue}>
              {location
                ? `${location.coords.latitude.toFixed(4)}\n${location.coords.longitude.toFixed(4)}`
                : '---'}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>🚗</Text>
            <Text style={styles.gridLabel}>HIZ</Text>
            <Text style={styles.gridValue}>{speed.toFixed(0)} km/h</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>🧭</Text>
            <Text style={styles.gridLabel}>YON</Text>
            <Text style={styles.gridValue}>{heading.toFixed(0)}°</Text>
          </View>
        </View>

        {/* GPS Sayaci */}
        <View style={styles.gpsBar}>
          <Text style={styles.gpsBarLabel}>GPS GONDERIM</Text>
          <Text style={styles.gpsBarValue}>{gpsCount} paket gonderildi</Text>
        </View>

        {/* Log */}
        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>SISTEM KAYITLARI</Text>
          {logs.length === 0 ? (
            <Text style={styles.logText}>Islem bekleniyor...</Text>
          ) : (
            logs.map((log, i) => (
              <Text key={i} style={styles.logText}>{log}</Text>
            ))
          )}
        </View>

        {/* SOS */}
        <TouchableOpacity
          style={styles.sosBtn}
          onPress={() => {
            Alert.alert('SOS', 'Acil durum sinyali gonderilsin mi?', [
              { text: 'Iptal', style: 'cancel' },
              {
                text: 'GONDER',
                style: 'destructive',
                onPress: () => {
                  socketRef.current?.emit('sos:alert', {
                    vehicleId,
                    position: location ? {
                      lat: location.coords.latitude,
                      lng: location.coords.longitude,
                    } : null,
                    timestamp: new Date().toISOString(),
                  });
                  addLog('!!! SOS SINYALI GONDERILDI !!!');
                },
              },
            ]);
          }}
        >
          <Text style={styles.sosIcon}>🛡️</Text>
          <Text style={styles.sosText}>SOS / PANIK BUTONU</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          CANTAK v1.0 | {Device.modelName || 'Device'} | {isOnline ? `↑ ${gpsCount}` : 'Offline'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2d',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  logoDotActive: {
    backgroundColor: '#10b981',
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1e1e2d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsBtnText: {
    fontSize: 18,
  },

  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 30,
  },

  // Status Card
  statusCard: {
    backgroundColor: '#0c0c1e',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e1e2d',
  },
  statusLeft: {
    flex: 1,
  },
  statusLabel: {
    color: '#4b5563',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  statusDetails: {
    marginTop: 8,
    gap: 3,
  },
  statusDetail: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '600',
  },
  powerBtn: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#1e1e2d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerBtnActive: {
    backgroundColor: '#6366f1',
  },
  powerIcon: {
    fontSize: 26,
    color: '#fff',
  },

  // Camera
  cameraContainer: {
    height: 240,
    backgroundColor: '#0c0c1e',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e1e2d',
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderIcon: {
    fontSize: 40,
    opacity: 0.3,
  },
  placeholderText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  placeholderSub: {
    color: '#1f2937',
    fontSize: 11,
    fontWeight: '600',
  },
  cameraOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  cameraTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  liveBadgeActive: {
    backgroundColor: '#ef4444',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
  },
  liveDotActive: {
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  flipBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipBtnText: {
    color: '#fff',
    fontSize: 20,
  },
  cameraBottomRow: {},
  camInfoBox: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 12,
  },
  camText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  camSubText: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#0c0c1e',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e1e2d',
    alignItems: 'center',
    gap: 4,
  },
  gridIcon: {
    fontSize: 18,
  },
  gridLabel: {
    color: '#4b5563',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  gridValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // GPS Bar
  gpsBar: {
    backgroundColor: '#0c0c1e',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e1e2d',
  },
  gpsBarLabel: {
    color: '#4b5563',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  gpsBarValue: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },

  // Logs
  logContainer: {
    backgroundColor: '#0c0c1e',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e1e2d',
    maxHeight: 200,
  },
  logTitle: {
    color: '#4b5563',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  logText: {
    color: '#6b7280',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 3,
  },

  // SOS
  sosBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  sosIcon: {
    fontSize: 22,
  },
  sosText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Footer
  footer: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e1e2d',
  },
  footerText: {
    color: '#374151',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#0c0c1e',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e1e2d',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1e1e2d',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtons: {
    marginTop: 24,
    gap: 10,
  },
  modalBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnSave: {
    backgroundColor: '#6366f1',
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  deviceInfo: {
    color: '#374151',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
});
