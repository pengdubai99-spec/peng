import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
  MediaStream,
} from 'react-native-webrtc';
import { getSocket } from '../services/socket';
import StatusDot from '../components/StatusDot';
import { useStore } from '../store/useStore';

interface LiveViewScreenProps {
  vehicleId: string;
  onBack: () => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

type ConnectionState = 'connecting' | 'connected' | 'failed' | 'closed';

export default function LiveViewScreen({ vehicleId, onBack }: LiveViewScreenProps) {
  const vehicle = useStore((s) => s.vehicles[vehicleId]);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const viewerIdRef = useRef(`viewer-${Date.now()}`);

  useEffect(() => {
    const socket = getSocket();
    const viewerId = viewerIdRef.current;

    // Offer geldiğinde
    const handleOffer = async (data: any) => {
      try {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerRef.current = pc;

        // Remote stream track'lerini al
        pc.addEventListener('track', (event: any) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
            setConnectionState('connected');
          } else if (event.track) {
            const stream = new MediaStream();
            stream.addTrack(event.track);
            setRemoteStream(stream);
            setConnectionState('connected');
          }
        });

        // ICE candidate gönder
        pc.addEventListener('icecandidate', (event: any) => {
          if (event.candidate) {
            socket.emit('webrtc:ice-candidate', {
              vehicleId,
              viewerId,
              candidate: event.candidate,
            });
          }
        });

        // Bağlantı durumu takibi
        pc.addEventListener('connectionstatechange', () => {
          const state = pc.connectionState;
          if (state === 'connected') setConnectionState('connected');
          else if (state === 'failed') setConnectionState('failed');
          else if (state === 'closed') setConnectionState('closed');
        });

        // Offer'ı set et ve answer oluştur
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc:answer', {
          vehicleId,
          viewerId,
          sdp: answer,
        });
      } catch (err) {
        console.error('WebRTC offer handling error:', err);
        setConnectionState('failed');
      }
    };

    // ICE candidate geldiğinde
    const handleIceCandidate = async (data: any) => {
      try {
        if (peerRef.current && data.candidate) {
          await peerRef.current.addIceCandidate(data.candidate);
        }
      } catch (err) {
        console.error('ICE candidate error:', err);
      }
    };

    // Eventleri dinle
    socket.on(`webrtc:offer:${viewerId}`, handleOffer);
    socket.on(`webrtc:ice-candidate:${viewerId}`, handleIceCandidate);

    // Stream iste
    socket.emit('webrtc:request-stream', { vehicleId, viewerId });

    return () => {
      socket.off(`webrtc:offer:${viewerId}`, handleOffer);
      socket.off(`webrtc:ice-candidate:${viewerId}`, handleIceCandidate);

      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      setRemoteStream(null);
    };
  }, [vehicleId]);

  const stateLabels: Record<ConnectionState, string> = {
    connecting: 'Bağlanıyor...',
    connected: 'Canlı Yayın',
    failed: 'Bağlantı başarısız',
    closed: 'Bağlantı kapandı',
  };

  const stateColors: Record<ConnectionState, string> = {
    connecting: '#f59e0b',
    connected: '#10b981',
    failed: '#ef4444',
    closed: '#64748b',
  };

  return (
    <View style={styles.container}>
      {/* Video Area */}
      <View style={styles.videoContainer}>
        {remoteStream ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.video}
            objectFit="cover"
            mirror={false}
          />
        ) : (
          <View style={styles.placeholder}>
            {connectionState === 'connecting' ? (
              <>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.placeholderText}>Araç kamerasına bağlanılıyor...</Text>
              </>
            ) : connectionState === 'failed' ? (
              <>
                <Text style={styles.placeholderIcon}>❌</Text>
                <Text style={styles.placeholderText}>Bağlantı kurulamadı</Text>
                <Text style={styles.placeholderSub}>Araç kamerası aktif olmayabilir</Text>
              </>
            ) : (
              <>
                <Text style={styles.placeholderIcon}>📹</Text>
                <Text style={styles.placeholderText}>Video bekleniyor...</Text>
              </>
            )}
          </View>
        )}
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Geri</Text>
      </TouchableOpacity>

      {/* Status Badge */}
      <View style={styles.statusBadge}>
        <View style={[styles.statusDot, { backgroundColor: stateColors[connectionState] }]} />
        <Text style={[styles.statusLabel, { color: stateColors[connectionState] }]}>
          {stateLabels[connectionState]}
        </Text>
      </View>

      {/* Info Bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoContent}>
          <View style={styles.infoLeft}>
            <Text style={styles.infoPlate}>{vehicle?.plate || vehicleId}</Text>
            {vehicle?.model && <Text style={styles.infoModel}>{vehicle.model}</Text>}
          </View>
          <View style={styles.infoRight}>
            {vehicle?.speed !== undefined && (
              <View style={styles.speedBadge}>
                <Text style={styles.speedValue}>{vehicle.speed.toFixed(0)}</Text>
                <Text style={styles.speedUnit}>km/s</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={onBack}>
          <Text style={styles.closeBtnText}>Yayını Kapat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050510',
    gap: 12,
  },
  placeholderIcon: {
    fontSize: 48,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderSub: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    position: 'absolute',
    top: 58,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(5,5,16,0.95)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLeft: {},
  infoPlate: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  infoModel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  infoRight: {},
  speedBadge: {
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  speedValue: {
    color: '#818cf8',
    fontSize: 20,
    fontWeight: '900',
  },
  speedUnit: {
    color: '#6366f1',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  closeBtn: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  closeBtnText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '800',
  },
});
