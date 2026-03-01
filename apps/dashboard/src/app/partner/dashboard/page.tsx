"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Car,
  MapPin,
  Video,
  BarChart3,
  Navigation,
  Wifi,
  Battery,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Settings,
  Bell,
  Menu,
  X
} from "lucide-react";
import { translations, Language } from "../../../lib/i18n";

export default function PartnerDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050510] flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <PartnerDashboardContent />
    </Suspense>
  );
}

function PartnerDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const partnerName = searchParams.get('partner') || 'Fleet Partner';
  const accessKey = searchParams.get('key') || '';
  const lang = (searchParams.get('lang') as Language) || 'en';

  const t = translations[lang];
  const isRtl = lang === 'ar';

  // Mock data for the partner
  const [myVehicles] = useState([
    { id: 1, plate: "DXB 5502", model: "BYD Han", status: "Active", battery: "82%", location: "Business Bay", speed: "45 km/h" },
    { id: 2, plate: "DXB 1190", model: "BYD Atto 3", status: "Charging", battery: "15%", location: "DXB Supercharger", speed: "0 km/h" },
    { id: 3, plate: "SHJ 8821", model: "BYD Tang", status: "On Trip", battery: "64%", location: "Sharjah Road", speed: "82 km/h" },
  ]);

  const SidebarContent = () => (
    <>
      <div className="p-8 lg:p-10 flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-black gradient-text-peng">PORTAL</h2>
      </div>

      <nav className="flex-1 px-4 lg:px-6 space-y-2">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-4 px-4">{t.myFleet}</div>

        <button onClick={() => setSidebarOpen(false)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/[0.05] border border-white/5 text-white shadow-xl shadow-indigo-500/5">
          <LayoutDashboard className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-bold">{t.activeVehicles}</span>
        </button>

        <button onClick={() => setSidebarOpen(false)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-400 hover:bg-white/[0.03] transition-all">
          <Video className="w-5 h-5" />
          <span className="text-sm font-bold">{t.liveMonitoring}</span>
        </button>

        <button onClick={() => setSidebarOpen(false)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-400 hover:bg-white/[0.03] transition-all">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm font-bold">{t.analytics}</span>
        </button>
      </nav>

      <div className="p-6 lg:p-8 border-t border-white/[0.05]">
         <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 mb-6">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{t.partnerId}</p>
            <p className="text-xs font-bold text-indigo-400 font-mono tracking-wider">{accessKey}</p>
         </div>
         <button
           onClick={() => router.push('/partner')}
           className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
         >
           <LogOut className="w-5 h-5" />
           <span>{t.logout}</span>
         </button>
      </div>
    </>
  );

  return (
    <div className={`flex min-h-screen bg-[#050510] text-white font-['Outfit'] ${isRtl ? 'font-["IBM_Plex_Sans_Arabic"]' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex w-72 border-white/[0.05] bg-white/[0.01] backdrop-blur-3xl flex-col relative z-20 ${isRtl ? 'border-l' : 'border-r'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: isRtl ? 300 : -300 }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? 300 : -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`fixed top-0 ${isRtl ? 'right-0' : 'left-0'} w-72 h-full bg-[#0a0a1a] border-white/[0.05] flex flex-col z-50 lg:hidden ${isRtl ? 'border-l' : 'border-r'}`}
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center z-10`}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 relative z-10 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 lg:mb-12 gap-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center"
            >
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-white mb-1">{partnerName}</h1>
              <p className="text-slate-400 font-medium text-xs sm:text-sm">{t.welcomeBack}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex bg-white/[0.03] rounded-xl p-1 border border-white/5">
              {(['en', 'tr', 'ar'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => router.push(`/partner/dashboard?key=${accessKey}&partner=${encodeURIComponent(partnerName)}&lang=${l}`)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${lang === l ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/[0.05] transition-all">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/[0.05] transition-all">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
           {[
             { label: t.activeVehicles, value: myVehicles.length, icon: Car, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
             { label: t.avgBattery, value: '62%', icon: Battery, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
             { label: t.totalDistance, value: '1,280 KM', icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-500/10' }
           ].map((stat, i) => (
             <motion.div
               whileHover={{ y: -5 }}
               key={i}
               className="p-5 sm:p-8 rounded-2xl sm:rounded-[32px] bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl flex sm:block items-center gap-4"
             >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${stat.bg} flex items-center justify-center sm:mb-6 shrink-0`}>
                   <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 mb-0.5 sm:mb-1">{stat.label}</p>
                  <p className="text-xl sm:text-3xl font-black text-white">{stat.value}</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Live Monitoring */}
        <div className="mb-8 lg:mb-12">
           <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">{t.liveMonitoring}</h3>
              <span className="px-3 sm:px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black border border-indigo-500/20 flex items-center gap-2">
                <Wifi className="w-3 h-3 animate-pulse" />
                {t.systemOnline}
              </span>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
              {/* Vehicle List */}
              <div className="space-y-3 sm:space-y-4">
                 {myVehicles.map((v) => (
                   <motion.div
                     whileHover={{ x: 10 }}
                     key={v.id}
                     className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 transition-all cursor-pointer group flex items-center justify-between gap-3"
                   >
                     <div className="flex gap-3 sm:gap-4 items-center min-w-0">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/[0.03] flex items-center justify-center shrink-0">
                           <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 rotate-45" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-sm font-black text-white">{v.plate}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{v.model}</p>
                        </div>
                     </div>
                     <div className={`${isRtl ? 'text-left' : 'text-right'} shrink-0`}>
                        <p className="text-[11px] sm:text-xs font-bold text-slate-300">{v.location}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${v.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>{v.status}</p>
                     </div>
                     <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0 hidden sm:block ${isRtl ? 'rotate-180' : ''}`} />
                   </motion.div>
                 ))}
              </div>

              {/* Map Placeholder */}
              <div className="relative rounded-2xl sm:rounded-[40px] border border-white/5 overflow-hidden group min-h-[250px] sm:min-h-[400px]">
                 <div className="absolute inset-0 bg-[#0a0a20]">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                    <svg className="absolute inset-0 w-full h-full opacity-30">
                       <path d="M 0 100 Q 100 0 200 100 T 400 100" stroke="#6366f1" fill="transparent" strokeWidth="2" strokeDasharray="5,5" />
                    </svg>

                    <div className="absolute top-[30%] left-[40%] text-center">
                       <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-xl shadow-indigo-500 animate-bounce" />
                       <span className="text-[9px] font-black text-white/50 block mt-2">DXB 5502</span>
                    </div>
                    <div className="absolute top-[60%] left-[70%] text-center">
                       <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-xl shadow-emerald-500" />
                       <span className="text-[9px] font-black text-white/50 block mt-2">SHJ 8821</span>
                    </div>

                    <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} sm:top-6 ${isRtl ? 'sm:right-6' : 'sm:left-6'} p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0c0c1e]/80 backdrop-blur-xl border border-white/10`}>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">{t.liveView}</p>
                       <p className="text-[11px] sm:text-xs font-bold text-white">Downtown Dubai</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <style jsx global>{`
        .gradient-text-peng {
          background: linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}
