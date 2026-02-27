import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
  AppState,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import { io, Socket } from 'socket.io-client';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';

// ── Config ──────────────────────────────────────────────────
const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const DEFAULT_SERVER = '192.168.1.60';
const DEFAULT_PORT = '3005';

// ── Types ───────────────────────────────────────────────────
interface LogEntry {
  time: string;
  msg: string;
  type: 'info' | 'error' | 'success';
}

// ── App ─────────────────────────────────────────────────────
export default function App() {
  // permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationGranted, setLocationGranted] = useState(false);

  // settings
  const [settingsVisible, setSettingsVisible] = useState(true);
  const [serverIP, setServerIP] = useState(DEFAULT_SERVER);
  const [serverPort, setServerPort] = useState(DEFAULT_PORT);
  const [vehicleId, setVehicleId] = useState('vehicle-001');

  // state
  const [connected, setConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [viewers, setViewers] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // refs
  const socketRef = useRef<Socket | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStream = useRef<MediaStream | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);

  // ── Logging ─────────────────────────────────────────────
  const log = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('tr-TR');
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 100));
  }, []);

  // ── Permissions ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        const bg = await Location.requestBackgroundPermissionsAsync();
        if (bg.status === 'granted') {
          log('Arka plan konum izni verildi', 'success');
        }
      }
    })();
  }, []);

  // ── Connect to Server ───────────────────────────────────
  const connectToServer = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
    }

    const url = `http://${serverIP}:${serverPort}`;
    log(`Sunucuya bağlanılıyor: ${url}`);

    const socket = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setConnected(true);
      log('Sunucuya bağlandı', 'success');
      // Start GPS tracking
      startGPSTracking(socket);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      log('Sunucu bağlantısı kesildi', 'error');
    });

    socket.on('connect_error', (err) => {
      log(`Bağlantı hatası: ${err.message}`, 'error');
    });

    // WebRTC signaling
    socket.on('webrtc:request-stream', async (data: { viewerId: string }) => {
      log(`İzleyici bağlanıyor: ${data.viewerId.slice(0, 8)}`);
      await createPeerConnection(socket, data.viewerId);
    });

    socket.on('webrtc:answer', async (data: { viewerId: string; sdp: string }) => {
      const pc = peerConnections.current.get(data.viewerId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
        log('WebRTC answer alındı', 'success');
      }
    });

    socket.on('webrtc:ice-candidate', async (data: { viewerId: string; candidate: any }) => {
      const pc = peerConnections.current.get(data.viewerId);
      if (pc && data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socketRef.current = socket;
    setSettingsVisible(false);
  }, [serverIP, serverPort, vehicleId, log]);

  // ── GPS Tracking ────────────────────────────────────────
  const startGPSTracking = useCallback(async (socket: Socket) => {
    if (locationSub.current) {
      locationSub.current.remove();
    }

    try {
      locationSub.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (location) => {
          const { latitude, longitude, speed: spd, heading: hdg, altitude } = location.coords;
          setSpeed(spd ? Math.round(spd * 3.6) : 0); // m/s -> km/h
          setHeading(hdg || 0);

          socket.emit('location:update', {
            vehicleId,
            position: { lat: latitude, lng: longitude },
            speed: spd || 0,
            heading: hdg || 0,
            altitude: altitude || 0,
            timestamp: new Date().toISOString(),
            metadata: {
              device: Device.modelName || 'unknown',
              os: Platform.OS,
              battery: null,
            },
          });
        }
      );
      log('GPS takibi başlatıldı', 'success');
    } catch (err: any) {
      log(`GPS hatası: ${err.message}`, 'error');
    }
  }, [vehicleId, log]);

  // ── WebRTC ──────────────────────────────────────────────
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: facing === 'front' ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 15 },
        },
      });
      localStream.current = stream as MediaStream;
      log('Yerel medya akışı başlatıldı', 'success');
      return stream;
    } catch (err: any) {
      log(`Medya hatası: ${err.message}`, 'error');
      return null;
    }
  }, [facing, log]);

  const createPeerConnection = useCallback(async (socket: Socket, viewerId: string) => {
    // Ensure local stream exists
    if (!localStream.current) {
      const stream = await startLocalStream();
      if (!stream) return;
    }

    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });

    // Add tracks
    localStream.current?.getTracks().forEach((track: any) => {
      pc.addTrack(track, localStream.current!);
    });

    // ICE candidates
    pc.onicecandidate = (event: any) => {
      if (event.candidate) {
        socket.emit('webrtc:ice-candidate', {
          vehicleId,
          viewerId,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = (pc as any).iceConnectionState;
      log(`ICE durumu: ${state}`);
      if (state === 'connected') {
        setViewers(prev => prev + 1);
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        setViewers(prev => Math.max(0, prev - 1));
        peerConnections.current.delete(viewerId);
        pc.close();
      }
    };

    // Create and send offer
    const offer = await pc.createOffer({});
    await pc.setLocalDescription(offer);

    socket.emit('webrtc:offer', {
      vehicleId,
      viewerId,
      sdp: offer.sdp,
    });

    peerConnections.current.set(viewerId, pc);
  }, [vehicleId, startLocalStream, log]);

  const toggleStreaming = useCallback(async () => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      Alert.alert('Hata', 'Sunucuya bağlı değil');
      return;
    }

    if (streaming) {
      // Stop streaming
      socket.emit('webrtc:stop-stream', { vehicleId });
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      localStream.current?.getTracks().forEach((t: any) => t.stop());
      localStream.current = null;
      setStreaming(false);
      setViewers(0);
      log('Yayın durduruldu');
    } else {
      // Start streaming
      const stream = await startLocalStream();
      if (!stream) return;
      socket.emit('webrtc:start-stream', { vehicleId });
      setStreaming(true);
      log('Yayın başlatıldı', 'success');
    }
  }, [streaming, vehicleId, startLocalStream, log]);

  // ── Cleanup ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      locationSub.current?.remove();
      socketRef.current?.disconnect();
      peerConnections.current.forEach((pc) => pc.close());
      localStream.current?.getTracks().forEach((t: any) => t.stop());
    };
  }, []);

  // ── SOS ─────────────────────────────────────────────────
  const sendSOS = useCallback(() => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('sos:alert', {
        vehicleId,
        timestamp: new Date().toISOString(),
        device: Device.modelName,
      });
      log('SOS gönderildi!', 'error');
      Alert.alert('SOS', 'Acil durum sinyali gönderildi!');
    } else {
      Alert.alert('Hata', 'Sunucuya bağlı değil');
    }
  }, [vehicleId, log]);

  // ── Render ──────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050510" />

      {/* Camera Preview */}
      {cameraPermission?.granted && streaming && (
        <CameraView style={styles.camera} facing={facing}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.flipBtn}
              onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
            >
              <Text style={styles.flipText}>⟲</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: connected ? '#00ff88' : '#ff4444' }]} />
          <Text style={styles.statusText}>
            {connected ? 'Bağlı' : 'Bağlantı yok'}
          </Text>
          {streaming && (
            <>
              <View style={[styles.dot, { backgroundColor: '#ff0000', marginLeft: 16 }]} />
              <Text style={styles.statusText}>CANLI</Text>
              <Text style={styles.viewerText}>{viewers} izleyici</Text>
            </>
          )}
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.speedText}>{speed} km/h</Text>
          <Text style={styles.headingText}>{Math.round(heading)}°</Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.btn, streaming ? styles.btnStop : styles.btnStart]}
          onPress={toggleStreaming}
        >
          <Text style={styles.btnText}>
            {streaming ? '⏹ Yayını Durdur' : '▶ Yayın Başlat'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSOS} onPress={sendSOS}>
          <Text style={styles.btnSOSText}>SOS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSettings}
          onPress={() => setSettingsVisible(true)}
        >
          <Text style={styles.btnSettingsText}>⚙ Ayarlar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnLog}
          onPress={() => setShowLogs(!showLogs)}
        >
          <Text style={styles.btnLogText}>📋 Log</Text>
        </TouchableOpacity>
      </View>

      {/* Log Panel */}
      {showLogs && (
        <View style={styles.logPanel}>
          <ScrollView style={styles.logScroll}>
            {logs.map((l, i) => (
              <Text
                key={i}
                style={[
                  styles.logText,
                  l.type === 'error' && styles.logError,
                  l.type === 'success' && styles.logSuccess,
                ]}
              >
                [{l.time}] {l.msg}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Settings Modal */}
      <Modal visible={settingsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>CanTak Ayarları</Text>

            <Text style={styles.label}>Sunucu IP</Text>
            <TextInput
              style={styles.input}
              value={serverIP}
              onChangeText={setServerIP}
              placeholder="192.168.1.100"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Port</Text>
            <TextInput
              style={styles.input}
              value={serverPort}
              onChangeText={setServerPort}
              placeholder="3005"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Araç ID</Text>
            <TextInput
              style={styles.input}
              value={vehicleId}
              onChangeText={setVehicleId}
              placeholder="vehicle-001"
              placeholderTextColor="#666"
            />

            <TouchableOpacity style={styles.btnConnect} onPress={connectToServer}>
              <Text style={styles.btnConnectText}>Bağlan</Text>
            </TouchableOpacity>

            {connected && (
              <TouchableOpacity
                style={styles.btnClose}
                onPress={() => setSettingsVisible(false)}
              >
                <Text style={styles.btnCloseText}>Kapat</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 50,
    right: 16,
  },
  flipBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: '#fff',
    fontSize: 24,
  },
  statusBar: {
    backgroundColor: '#0a0a1a',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: '#ccc',
    fontSize: 14,
  },
  viewerText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 8,
  },
  speedText: {
    color: '#00ff88',
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 16,
  },
  headingText: {
    color: '#888',
    fontSize: 16,
  },
  controls: {
    padding: 16,
    gap: 12,
  },
  btn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnStart: {
    backgroundColor: '#00aa55',
  },
  btnStop: {
    backgroundColor: '#cc3333',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  btnSOS: {
    backgroundColor: '#ff0000',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSOSText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  btnSettings: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSettingsText: {
    color: '#aaa',
    fontSize: 14,
  },
  btnLog: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnLogText: {
    color: '#aaa',
    fontSize: 14,
  },
  logPanel: {
    backgroundColor: '#0a0a1a',
    maxHeight: 200,
    margin: 16,
    borderRadius: 8,
    padding: 8,
  },
  logScroll: {
    flex: 1,
  },
  logText: {
    color: '#888',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 2,
  },
  logError: {
    color: '#ff4444',
  },
  logSuccess: {
    color: '#00ff88',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#050510',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  btnConnect: {
    backgroundColor: '#00aa55',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  btnConnectText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  btnClose: {
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  btnCloseText: {
    color: '#888',
    fontSize: 14,
  },
});
