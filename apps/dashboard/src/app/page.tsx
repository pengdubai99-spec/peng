"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Navigation,
  Video,
  BrainCircuit,
  Shield,
  MapPin,
  Activity,
  ArrowRight,
  Sparkles,
  Languages,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Language, translations } from "../lib/i18n";

/* ===== FLOATING PARTICLES ===== */
function Particles() {
  const [particles, setParticles] = useState<Array<{left: string; top: string; delay: string; dur: string; w: string; bg: string}>>([]);
  useEffect(() => {
    const colors = [
      "rgba(99, 102, 241, 0.4)",
      "rgba(168, 85, 247, 0.4)",
      "rgba(236, 72, 153, 0.3)",
      "rgba(6, 182, 212, 0.4)",
    ];
    setParticles(
      Array.from({ length: 20 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        dur: `${6 + Math.random() * 6}s`,
        w: `${2 + Math.random() * 3}px`,
        bg: colors[Math.floor(Math.random() * 4)],
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.dur,
            width: p.w,
            height: p.w,
            background: p.bg,
          }}
        />
      ))}
    </div>
  );
}

/* ===== MAIN PAGE ===== */
export default function LandingPage() {
  const [lang, setLang] = useState<Language>('en');
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const features = [
    { icon: Navigation, label: t.gpsTitle, desc: t.gpsDesc, color: "from-indigo-500 to-blue-500" },
    { icon: Video, label: t.camTitle, desc: t.camDesc, color: "from-purple-500 to-violet-500" },
    { icon: BrainCircuit, label: t.aiTitle, desc: t.aiDesc, color: "from-pink-500 to-rose-500" },
    { icon: Shield, label: t.shieldTitle, desc: t.shieldDesc, color: "from-cyan-500 to-teal-500" },
  ];

  return (
    <div className={isRtl ? 'font-["IBM_Plex_Sans_Arabic"]' : ''} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Effects */}
      <div className="bg-mesh" />
      <div className="grid-pattern" />
      <Particles />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="nav-blur fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-md -z-10" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text-peng">
              {t.title}
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-4 border-e border-white/10 pe-8">
              {[
                { code: 'en', label: 'EN' },
                { code: 'tr', label: 'TR' },
                { code: 'ar', label: 'عربي' },
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as Language)}
                  className={`text-xs font-bold transition-all ${lang === l.code ? 'text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded' : 'text-slate-500 hover:text-white'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {[t.features, t.about, t.contact].map((item) => (
              <motion.a
                key={item}
                href="#"
                className="text-sm text-slate-400 hover:text-white transition-colors relative"
                whileHover={{ y: -1 }}
              >
                {item}
              </motion.a>
            ))}
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 text-sm font-medium rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                {t.login}
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium tracking-wide">
              {t.badge}
            </span>
            <Sparkles className="w-3 h-3 text-purple-400" />
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="gradient-text-peng">{t.title}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {t.subtitle}
          </motion.p>

          <motion.p
            className="text-sm md:text-base text-slate-500 max-w-xl mx-auto leading-relaxed mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {t.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="cta-button px-8 py-4 text-white font-semibold rounded-2xl flex items-center gap-3 text-base shadow-2xl shadow-purple-500/20"
              >
                <span>{t.start}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="px-8 py-4 text-slate-300 font-medium rounded-2xl border border-white/10 hover:bg-white/5 transition-all flex items-center gap-3 text-base"
            >
              <Activity className="w-4 h-4" />
              <span>{t.demo}</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="max-w-6xl mx-auto mt-32 w-full px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.div className="text-center mb-16">
            <motion.span
              className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400 mb-4 block"
            >
              {t.features}
            </motion.span>
            <motion.h2
              className="text-3xl md:text-5xl font-bold text-white"
            >
              {t.featureTitle.split('One Platform')[0]}
              <span className="gradient-text-peng">One Platform</span>
              {t.featureTitle.split('One Platform')[1]}
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="glass-card rounded-3xl p-8 relative overflow-hidden group cursor-pointer"
                onHoverStart={() => setHoveredFeature(i)}
                onHoverEnd={() => setHoveredFeature(null)}
                whileHover={{ scale: 1.01 }}
              >
                <div className="relative z-10 flex flex-col gap-5">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg w-fit`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all duration-300">
                      {feature.label}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>

                  <motion.div
                    className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-purple-400 transition-colors"
                  >
                    <span>{t.details}</span>
                    <motion.div
                      animate={hoveredFeature === i ? { x: isRtl ? -4 : 4 } : { x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="max-w-4xl mx-auto mt-32 mb-24 w-full px-4 text-center"
        >
          <div className="glass-card rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
            <div className="relative z-10">
              <MapPin className="w-8 h-8 text-purple-400 mx-auto mb-6" />
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t.heroAction}
              </h3>
              <p className="text-slate-400 max-w-lg mx-auto mb-8">
                {t.heroDesc}
              </p>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="cta-button px-10 py-4 text-white font-semibold rounded-2xl inline-flex items-center gap-3 text-base shadow-2xl shadow-purple-500/20"
                >
                  <span>{t.heroTitle}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="w-full border-t border-white/[0.04] py-8 text-center"
        >
          <p className="text-xs text-slate-600">
            &copy; 2026 {t.title}. {t.footer}
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
