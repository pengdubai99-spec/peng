"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Video,
  BrainCircuit,
  Shield,
  MapPin,
  ArrowRight,
  Play,
} from "lucide-react";
import { useState, useEffect } from "react";

/* ===== FLOATING PARTICLES (Green) ===== */
function Particles() {
  const [particles, setParticles] = useState<Array<{left: string; top: string; delay: string; dur: string; w: string; bg: string; blur: string}>>([]);
  useEffect(() => {
    const colors = [
      "rgba(34, 197, 94, 0.4)",
      "rgba(74, 222, 128, 0.3)",
      "rgba(22, 163, 74, 0.5)",
    ];
    setParticles(
      Array.from({ length: 30 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        dur: `${15 + Math.random() * 15}s`,
        w: `${1 + Math.random() * 2}px`,
        bg: colors[Math.floor(Math.random() * 3)],
        blur: `${Math.random() * 2}px`,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.dur,
            width: p.w,
            height: p.w,
            background: p.bg,
            boxShadow: `0 0 10px ${p.bg}`,
            filter: `blur(${p.blur})`,
            animation: 'particleFloat 20s ease-in-out infinite'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ===== MAIN PAGE ===== */
export default function LandingPage() {
  const features = [
    { 
      icon: MapPin, 
      label: "Canlı GPS Takip", 
      desc: "Araç konumlarini gercek zamanli izleyin. Rota gecmisi ve harita entegrasyonu ile tam kontrol." 
    },
    { 
      icon: Video, 
      label: "Akıllı Kamera", 
      desc: "HD canli yayin, otomatik goruntu kaydi ve bulut depolama ile 7/24 guvenlik." 
    },
    { 
      icon: BrainCircuit, 
      label: "AI Anomali Tespiti", 
      desc: "Yapay zeka ile olagandisi davranis algilama, anlik uyarilar ve detayli raporlama." 
    },
    { 
      icon: Shield, 
      label: "Güvenlik Kalkanı", 
      desc: "Panik butonu, SOS bildirimi ve uctan uca sifreli veri iletimi ile tam koruma." 
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#22c55e]/30 overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Faint green grid lines */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
            backgroundPosition: 'center 0',
            maskImage: 'radial-gradient(ellipse at top, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at top, black 0%, transparent 70%)'
          }}
        />
        {/* Top central green glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#22c55e]/5 rounded-full blur-[120px]" />
      </div>

      <Particles />

      <main className="relative z-10 max-w-[900px] mx-auto px-6 pt-32 pb-16 flex flex-col items-center">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center mb-20 w-full">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-[120px] font-black tracking-tight leading-none mb-6 relative"
            style={{
              color: 'transparent',
              WebkitTextStroke: '3px #22c55e',
              textShadow: '0 0 40px rgba(34, 197, 94, 0.4), 0 0 80px rgba(34, 197, 94, 0.1)',
            }}
          >
            PENG
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[#999999] max-w-[600px] text-[15px] leading-relaxed mb-10 font-medium"
          >
            Akıllı filo yönetiminin geleceği. Yapay zeka destekli GPS takip, canlı kamera izleme ve anomali tespiti ile filonuzu tek platformdan yönetin.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <Link href="/login">
              <button className="bg-[#22c55e] hover:bg-[#1ea950] text-black font-semibold px-8 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <span className="text-[15px]">Başla</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>
            </Link>
            <button className="bg-[#111111]/80 hover:bg-[#1a1a1a] border border-[#333] text-white font-medium px-8 py-3.5 rounded-2xl flex items-center gap-3 transition-all backdrop-blur-sm">
              <div className="w-5 h-5 flex items-center justify-center">
                <Play className="w-4 h-4 fill-white text-white" />
              </div>
              <span className="text-[15px]">Canlı Demo</span>
            </button>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="w-full mb-16">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-wide">Özellikler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-[#111111] border border-[#222] hover:border-[#22c55e]/40 rounded-3xl p-6 group transition-all duration-300 cursor-pointer"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-[14px] bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center group-hover:bg-[#22c55e]/10 group-hover:border-[#22c55e]/30 transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-[#22c55e]" />
                    </div>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3 className="text-base font-bold mb-2 text-white group-hover:text-[#22c55e] transition-colors duration-300">{feature.label}</h3>
                    <p className="text-[#888888] text-[13px] leading-relaxed mb-6">
                      {feature.desc}
                    </p>
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-[#555] mt-auto uppercase tracking-wide group-hover:text-white transition-colors duration-300">
                      Detayları gör
                      <ArrowRight className="w-3.5 h-3.5 group-hover:text-[#22c55e] transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Bottom */}
        <section className="w-full mb-20">
          <div className="bg-[#111111] border border-[#222] rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-[17px] font-bold mb-1 text-white">PENG ile tanışın.</h3>
              <p className="text-[#888888] text-[14px]">
                Kurulum gerektirmez, dakikalar içinde başlayın.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/login">
                <button className="bg-[#22c55e] hover:bg-[#1ea950] text-black font-semibold px-6 py-2.5 rounded-xl text-[14px] transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  Hemen Dene
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full text-center pb-8">
          <p className="text-[#444] text-[13px] font-medium tracking-wide">
            © 2022 Rok-PENG. Tüm hakları saklıdır.
          </p>
        </footer>
      </main>
    </div>
  );
}
