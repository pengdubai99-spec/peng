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
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import { Room, RoomEvent, LocalVideoTrack, LocalAudioTrack, registerGlobals } from '@livekit/react-native';

registerGlobals();

// ── Config ──────────────────────────────────────────────────
const DEFAULT_SERVER = 'saferide-tracking.onrender.com';
const DEFAULT_PORT = '';

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
  const livekitRoomRef = useRef<Room | null>(null);
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

    // If server looks like a domain (contains dots but no port needed), use https
    const isCloudServer = serverIP.includes('.') && !serverIP.match(/^\d+\.\d+\.\d+\.\d+$/);
    const url = isCloudServer
      ? `https://${serverIP}`
      : `http://${serverIP}:${serverPort}`;
    log(`Sunucuya bağlanılıyor: ${url}`);

    const socket = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 2000,
      timeout: 10000,
      forceNew: true,
    });

    socket.on('connect', async () => {
      setConnected(true);
      log('Sunucuya bağlandı', 'success');
      // Start GPS tracking
      startGPSTracking(socket);
      // Auto-start camera streaming via LiveKit
      try {
        const started = await startLivekitStream();
        if (started) {
          log('LiveKit kamera otomatik başlatıldı', 'success');
        }
      } catch (err: any) {
        log(`Otomatik kamera hatası: ${err.message}`, 'error');
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setStreaming(false);
      log('Sunucu bağlantısı kesildi - yeniden bağlanılıyor...', 'error');
    });

    socket.on('reconnect', async () => {
      log('Yeniden bağlandı, kamera yeniden başlatılıyor...', 'info');
      startGPSTracking(socket);
      try {
        if (!livekitRoomRef.current) {
          await startLivekitStream();
        }
        log('LiveKit Kamera yeniden başlatıldı', 'success');
      } catch (err: any) {
        log(`Yeniden başlatma hatası: ${err.message}`, 'error');
      }
    });

    socket.on('connect_error', (err) => {
      log(`Hata: ${err.message} (${err.name})`, 'error');
      console.log('Socket Error:', err);
    });

    socket.on('connect_error', (err) => {
      log(`Hata: ${err.message} (${err.name})`, 'error');
      console.log('Socket Error:', err);
    });

    socketRef.current = socket;
    // Don't close modal automatically, instead show logs
    setShowLogs(true);
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

  // ── LiveKit WebRTC ────────────────────────────────────────
  const livekitRoomRef = useRef<Room | null>(null);

  const startLivekitStream = useCallback(async () => {
    try {
      if (livekitRoomRef.current) {
        livekitRoomRef.current.disconnect();
      }

      // 1. Fetch token from Node.js standard API
      const isCloudServer = serverIP.includes('.') && !serverIP.match(/^\d+\.\d+\.\d+\.\d+$/);
      const apiUrl = isCloudServer
        ? `https://${serverIP}/livekit/token?room=${vehicleId}&participant=${vehicleId}&role=publisher`
        : `http://${serverIP}:${serverPort}/livekit/token?room=${vehicleId}&participant=${vehicleId}&role=publisher`;
      
      log(`LiveKit Token: ${apiUrl}`, 'info');
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Token alınamadı');
      
      const { token } = await response.json();
      const LIVEKIT_URL = 'wss://peng-cantak-3avcr64w.livekit.cloud';

      // 2. Setup Room
      const room = new Room();
      room.on(RoomEvent.Disconnected, () => {
        log('LiveKit odasından çıkıldı', 'error');
        setStreaming(false);
      });

      await room.connect(LIVEKIT_URL, token);
      log('LiveKit odasına bağlanıldı', 'success');

      // 3. Get Media Stream & Publish
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: facing === 'front' ? 'user' : 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { max: 15 },
        },
      });

      localStream.current = stream as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack) {
        const lvt = new LocalVideoTrack(videoTrack);
        await room.localParticipant.publishTrack(lvt);
      }
      if (audioTrack) {
        const lat = new LocalAudioTrack(audioTrack);
        await room.localParticipant.publishTrack(lat);
      }

      livekitRoomRef.current = room;
      setStreaming(true);
      log('LiveKit üzerine yayın başlatıldı!', 'success');

      // Notify the tracking server that this vehicle is streaming
      if (socketRef.current?.connected) {
        socketRef.current.emit('webrtc:start-stream', { vehicleId });
        log('Sunucuya yayın bildirimi gönderildi', 'success');
      }
      return true;

    } catch (err: any) {
      log(`LiveKit Hatası: ${err.message}`, 'error');
      setStreaming(false);
      return false;
    }
  }, [facing, log, serverIP, serverPort, vehicleId]);

  // ── Cleanup ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      locationSub.current?.remove();
      socketRef.current?.disconnect();
      livekitRoomRef.current?.disconnect();
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

      {/* Camera Preview - her zaman açık */}
      {cameraPermission?.granted && connected && (
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
        {/* Kamera durumu */}
        <View style={[styles.btn, streaming ? styles.btnStart : styles.btnSettings]}>
          <Text style={[styles.btnText, !streaming && { color: '#888' }]}>
            {streaming ? '🔴 KAMERA AÇIK - Otomatik Yayın' : '⏳ Kamera bekleniyor...'}
          </Text>
        </View>

        <TouchableOpacity style={styles.btnSOS} onPress={sendSOS}>
          <Text style={styles.btnSOSText}>SOS</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={[styles.btnSettings, { flex: 1 }]}
            onPress={() => setSettingsVisible(true)}
          >
            <Text style={styles.btnSettingsText}>⚙ Ayarlar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnLog, { flex: 1 }]}
            onPress={() => setShowLogs(!showLogs)}
          >
            <Text style={styles.btnLogText}>📋 Log</Text>
          </TouchableOpacity>
        </View>
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
              placeholder="saferide-tracking.onrender.com"
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

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.btnLog, { flex: 1, marginRight: 8 }]}
                onPress={() => setShowLogs(!showLogs)}
              >
                <Text style={styles.btnLogText}>{showLogs ? 'Log Kapat' : 'Log Göster'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnClose, { flex: 1, marginTop: 0 }]}
                onPress={() => setSettingsVisible(false)}
              >
                <Text style={styles.btnCloseText}>Kapat</Text>
              </TouchableOpacity>
            </View>

            {showLogs && (
              <View style={[styles.logPanel, { margin: 0, marginTop: 16, maxHeight: 150 }]}>
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
