"use client";

import { useState, useEffect, useRef } from "react";
import { Navigation, Video, Activity, Wifi, MapPin, Camera, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function DriverTestPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [ `${new Date().toLocaleTimeString()}: ${msg}`, ...prev.slice(0, 4)]);
  };

  // GPS Takibi Başlat
  const startTracking = () => {
    if (!navigator.geolocation) {
      addLog("GPS desteklenmiyor!");
      return;
    }

    setIsTracking(true);
    addLog("GPS takibi baslatildi...");
    
    navigator.geolocation.watchPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(newCoords);
        // Burada socket.emit('LOCATION_UPDATE', ...) yapilacak
        addLog(`Konum: ${newCoords.lat.toFixed(4)}, ${newCoords.lng.toFixed(4)}`);
      },
      (err) => addLog(`Hata: ${err.message}`),
      { enableHighAccuracy: true }
    );
  };

  // Kamerayi Başlat
  const startCamera = async () => {
    try {
      addLog("Kamera izni isteniyor...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, // Arka kamera
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        addLog("Canli yayin aktif!");
      }
    } catch (err) {
      addLog("Kamera acilamadi!");
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white p-6 font-['Outfit']">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">PENG Driver Tester</h1>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Saha Test Unit-01</p>
          </div>
        </div>

        {/* Video Preview */}
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-white/5 shadow-2xl">
          {!isStreaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-600">
              <Video className="w-10 h-10" />
              <p className="text-sm font-medium">Kamera Kapali</p>
            </div>
          )}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-cover ${isStreaming ? 'opacity-100' : 'opacity-0'}`} 
          />
          {isStreaming && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-[10px] font-bold">LIVE</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={startTracking}
            disabled={isTracking}
            className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${isTracking ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400' : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.05]'}`}
          >
            <MapPin className="w-6 h-6" />
            <span className="text-xs font-bold uppercase">{isTracking ? 'GPS Aktif' : 'Konum Paylas'}</span>
          </button>

          <button
            onClick={startCamera}
            disabled={isStreaming}
            className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${isStreaming ? 'bg-purple-600/20 border-purple-500/50 text-purple-400' : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.05]'}`}
          >
            <Camera className="w-6 h-6" />
            <span className="text-xs font-bold uppercase">{isStreaming ? 'Yayin Aktif' : 'Kamera Ac'}</span>
          </button>
        </div>

        {/* Status Info */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold uppercase">Sinyal Gucu</span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Lat/Lng</span>
              <span className="font-mono">{coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Bekleniyor...'}</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div animate={{ x: ["0%", "100%"] }} transition={{ duration: 2, repeat: Infinity }} className="w-1/3 h-full bg-indigo-500/50" />
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2">Sistem Loglari</p>
          <div className="bg-black/40 rounded-2xl p-4 font-mono text-[10px] text-slate-500 space-y-1 border border-white/[0.02]">
            {logs.length === 0 && <p>Sistem bosta...</p>}
            {logs.map((log, i) => <p key={i}>{log}</p>)}
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-700">
          Bu cihaz su an saha test verisi uretmektedir.
        </p>
      </div>
    </div>
  );
}
