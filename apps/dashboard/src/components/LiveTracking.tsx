"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  MapPin, 
  Activity, 
  Maximize2, 
  X, 
  Shield, 
  Wifi, 
  Navigation,
  ShieldAlert
} from 'lucide-react';
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

// Dynamic import for Leaflet (breaks in SSR)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Tracking Service URL
const TRACKING_URL = "http://localhost:3003";
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

interface LiveTrackingProps {
  lang: string;
}

export default function LiveTracking({ lang }: LiveTrackingProps) {
  const [vehicles, setVehicles] = useState<Record<string, any>>({});
  const [activeStreams, setActiveStreams] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [status, setStatus] = useState('connecting');
  const [fatigueAlerts, setFatigueAlerts] = useState<Record<string, boolean>>({});
  
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const viewerId = useRef('viewer-' + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    // 1. Socket Connection
    socketRef.current = io(TRACKING_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      setStatus('online');
      socketRef.current?.emit("webrtc:stream-list");
      socketRef.current?.emit("location:subscribe", { fleetId: "global" });
    });

    socketRef.current.on("disconnect", () => setStatus('offline'));

    // 2. Data Handlers
    socketRef.current.on("location:data", (data: any) => {
      setVehicles(prev => ({
        ...prev,
        [data.vehicleId]: { ...data, lastUpdate: Date.now() }
      }));
    });

    socketRef.current.on("webrtc:stream-list", (data: any) => {
      setActiveStreams(data.activeStreams || []);
    });

    socketRef.current.on("webrtc:stop-stream", (data: any) => {
      if (data.vehicleId === selectedVehicle) {
        stopWatching();
      }
      setActiveStreams(prev => prev.filter(id => id !== data.vehicleId));
    });

    // 3. WebRTC Signaling Handlers
    socketRef.current.on(`webrtc:offer:${viewerId.current}`, async (data: any) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socketRef.current?.emit('webrtc:answer', {
          vehicleId: data.vehicleId,
          viewerId: viewerId.current,
          sdp: answer.sdp,
        });
      } catch (e) {
        console.error('WebRTC offer error:', e);
      }
    });

    socketRef.current.on(`webrtc:ice-candidate:${viewerId.current}`, async (data: any) => {
      if (pcRef.current && data.candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error('ICE candidate error:', e);
        }
      }
    });

    socketRef.current.on("ai:alert", (data: any) => {
      if (data.type === 'FATIGUE') {
        setFatigueAlerts(prev => ({ ...prev, [data.vehicleId]: true }));
        // Reset alert after some time
        setTimeout(() => {
          setFatigueAlerts(prev => ({ ...prev, [data.vehicleId]: false }));
        }, 5000);
      }
    });

    return () => {
      stopWatching();
      socketRef.current?.disconnect();
    };
  }, []);

  const requestStream = (vehicleId: string) => {
    stopWatching();
    setSelectedVehicle(vehicleId);
    setIsWatching(true);

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('webrtc:ice-candidate', {
          vehicleId,
          viewerId: viewerId.current,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    socketRef.current?.emit('webrtc:request-stream', {
      vehicleId,
      viewerId: viewerId.current,
    });
  };

  const stopWatching = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWatching(false);
    setSelectedVehicle(null);
  };

  const simulateAlert = () => {
    if (socketRef.current) {
      socketRef.current.emit("ai:simulate-alert", {
        vehicleId: selectedVehicle || "DXB-LIVE-TEST",
        type: "FATIGUE",
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  return (
    <div className="h-full flex gap-6 relative">
      {/* 1. Sidebar - Stream List & Status */}
      <div className="w-80 flex flex-col gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {lang === 'tr' ? 'Sunucu Baglantisi' : 'Server Status'}
            </span>
          </div>
          <span className={`text-[10px] font-bold ${status === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
            {status.toUpperCase()}
          </span>
        </div>

        <div className="flex-1 glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
              {lang === 'tr' ? 'Aktif Yayinlar' : 'Active Streams'}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {activeStreams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wifi className="w-8 h-8 text-slate-800 mb-2 opacity-20" />
                <p className="text-[10px] text-slate-600 font-bold uppercase">No Live Signals</p>
              </div>
            ) : (
              activeStreams.map(id => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => requestStream(id)}
                  className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    selectedVehicle === id 
                    ? 'bg-indigo-500/10 border-indigo-500/30' 
                    : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedVehicle === id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400'}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs font-bold text-white uppercase">{id}</p>
                    <p className="text-[9px] text-emerald-400 font-mono">LIVE • 1080p</p>
                  </div>
                  {fatigueAlerts[id] && (
                    <motion.div 
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="px-2 py-0.5 rounded bg-red-500 text-[8px] font-black text-white"
                    >
                      FATIGUE
                    </motion.div>
                  )}
                </motion.button>
              ))
            )}
          </div>
          
          <div className="p-4 bg-white/[0.02] border-t border-white/5">
            <button 
              onClick={simulateAlert}
              className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Simulate AI Alert
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content - Map & Video Interface */}
      <div className="flex-1 glass-card rounded-3xl border border-white/5 overflow-hidden relative group">
        
        {/* LEAFLET MAP */}
        <div className="absolute inset-0 z-0">
          <MapContainer 
            center={[25.2048, 55.2708]} 
            zoom={13} 
            style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {Object.values(vehicles).map((v: any) => (
              v.position && (
                <Marker 
                  key={v.vehicleId} 
                  position={[v.position.lat, v.position.lng]}
                >
                  <Popup>
                    <div className="text-slate-900 p-2">
                       <p className="font-bold text-xs">{v.vehicleId}</p>
                       <p className="text-[10px]">{v.speed} km/h</p>
                       <button 
                         onClick={() => requestStream(v.vehicleId)}
                         className="mt-2 w-full py-1 bg-indigo-600 text-white rounded text-[9px] font-bold"
                       >
                         WATCH LIVE
                       </button>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>

        {/* Floating Video Overlay */}
        <AnimatePresence>
          {isWatching && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-6 right-6 w-[400px] aspect-video glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-20 flex flex-col"
            >
              <div className="p-3 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">LIVE: {selectedVehicle}</span>
                </div>
                <button onClick={stopWatching} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 bg-black relative">
                 <video 
                   ref={videoRef}
                   autoPlay 
                   playsInline 
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute bottom-4 left-4 flex gap-2">
                   <div className="px-2 py-1 rounded bg-black/50 text-[10px] font-mono text-emerald-400">7.4 Mbps</div>
                   <div className="px-2 py-1 rounded bg-black/50 text-[10px] font-mono text-white">30 FPS</div>
                 </div>

                 {/* AI Vision Overlay */}
                 <div className="absolute inset-0 pointer-events-none border-2 border-indigo-500/20 m-4 rounded-lg">
                    <div className="absolute top-2 left-2 bg-indigo-500 px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-tighter">AI VISION ACTIVE</div>
                    
                    {/* Fake Face Tracking Box if watching */}
                    <motion.div 
                      animate={{ x: [100, 120, 110], y: [60, 70, 65] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className={`absolute w-32 h-32 border-2 rounded-lg ${fatigueAlerts[selectedVehicle!] ? 'border-red-500' : 'border-indigo-400/50'}`}
                    >
                       <div className={`absolute -top-5 left-0 px-1 rounded text-[8px] font-bold ${fatigueAlerts[selectedVehicle!] ? 'bg-red-500 text-white' : 'bg-indigo-500/50 text-white'}`}>
                         DRIVER_FACE: {fatigueAlerts[selectedVehicle!] ? 'DROWSY' : 'NORMAL'}
                       </div>
                    </motion.div>

                    {/* AI Scanline */}
                    <motion.div 
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ repeat: Infinity, duration: 10 }}
                      className="absolute left-0 right-0 h-[1px] bg-indigo-500/20 shadow-[0_0_10px_#6366f1]"
                    />
                 </div>

                 {fatigueAlerts[selectedVehicle!] && (
                   <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center pointer-events-none animate-pulse">
                      <div className="bg-red-600 text-white px-6 py-2 rounded-lg font-black text-sm shadow-2xl flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5" />
                        FATIGUE DETECTED!
                      </div>
                   </div>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map UI Overlay */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
          <div className="glass-card px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
             <Navigation className="w-4 h-4 text-indigo-400" />
             <div>
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Fleet Active Areas</p>
               <p className="text-xs font-bold text-white">Dubai - Sheikh Zayed Rd</p>
             </div>
          </div>
        </div>

        <div className="absolute inset-0 z-1 pointer-events-none">
           {Object.values(vehicles).map((v: any) => {
             const x = ((v.position.lng - 55.1) / 0.3) * 100;
             const y = 100 - ((v.position.lat - 25.0) / 0.3) * 100;
             return (
               <motion.div
                 key={v.vehicleId}
                 animate={{ left: `${x}%`, top: `${y}%` }}
                 className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2"
               >
                 <div className="relative">
                   <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping scale-200" />
                   <div className={`w-3 h-3 rounded-full border-2 border-white shadow-lg ${selectedVehicle === v.vehicleId ? 'bg-white' : 'bg-indigo-500'}`} />
                 </div>
               </motion.div>
             );
           })}
        </div>
      </div>
    </div>
  );
}
