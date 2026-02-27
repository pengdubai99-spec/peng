"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Car, 
  Map as MapIcon, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  ChevronRight,
  TrendingUp,
  Clock,
  Navigation,
  Activity,
  DollarSign,
  ShieldAlert,
  History,
  Wrench,
  Users,
  X,
  AlertTriangle,
  Cpu,
  Zap,
  ShieldCheck
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import LiveTracking from "../../components/LiveTracking";

// Tracking Service URL
const TRACKING_URL = "http://localhost:3005";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState(0);
  const [alert, setAlert] = useState<any>(null);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const isRtl = lang === 'ar';

  const [vehicles, setVehicles] = useState<Record<string, any>>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Initialize Socket
    socketRef.current = io(TRACKING_URL, {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Dashboard connected to Tracking Service");
      // Subscribe to all updates
      socketRef.current?.emit("location:subscribe", { fleetId: "global" });
    });

    socketRef.current.on("location:data", (data: any) => {
      setVehicles(prev => ({
        ...prev,
        [data.vehicleId]: {
          ...data,
          lastUpdate: new Date().getTime()
        }
      }));
    });

    socketRef.current.on("ai:alert", (data: any) => {
      setAlert(data);
      // Auto-clear alert after 8 seconds
      setTimeout(() => setAlert(null), 8000);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const menuItems = [
    { id: 0, icon: LayoutDashboard, label: lang === 'tr' ? "Genel Bakis" : (lang === 'ar' ? "لوحة القيادة" : "Overview") },
    { id: 1, icon: Car, label: lang === 'tr' ? "Araclar" : (lang === 'ar' ? "المركبات" : "Vehicles") },
    { id: 2, icon: MapIcon, label: lang === 'tr' ? "Canli Takip" : (lang === 'ar' ? "تتبع مباشر" : "Live Tracking") },
    { id: 3, icon: Clock, label: lang === 'tr' ? "Gecmis" : (lang === 'ar' ? "السجل" : "History") },
    { id: 4, icon: Settings, label: lang === 'tr' ? "Ayarlar" : (lang === 'ar' ? "الإعدادات" : "Settings") },
    { id: 5, icon: ShieldAlert, label: lang === 'tr' ? "Yonetim" : (lang === 'ar' ? "لوحة التحكم" : "Admin"), path: '/admin' },
  ];

  const handleMenuClick = (item: any) => {
    if (item.path) {
      router.push(item.path);
    } else {
      setActiveTab(item.id);
    }
  };

  const filteredMenuItems = user?.role === 'FLEET_MANAGER' 
    ? menuItems.filter(i => i.id !== 5) 
    : menuItems;

  return (
    <div className={`flex min-h-screen bg-[#050510] text-[#f0f0ff] font-['Outfit'] ${isRtl ? 'font-["IBM_Plex_Sans_Arabic"] flex-row-reverse' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Mesh Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className={`w-64 border-x border-white/[0.05] bg-white/[0.02] backdrop-blur-xl flex flex-col relative z-20 ${isRtl ? 'border-l' : 'border-r'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            {user?.role === 'FLEET_MANAGER' ? <Car className="w-4 h-4 text-white" /> : <Navigation className="w-4 h-4 text-white" />}
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight gradient-text-peng">PENG</span>
            {user?.role === 'FLEET_MANAGER' && <span className="text-[8px] font-black tracking-widest text-slate-500 uppercase -mt-1">Partner Portal</span>}
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? "bg-white/[0.08] text-white shadow-lg shadow-indigo-500/5" 
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-indigo-400' : ''}`} />
              <span className="text-sm font-medium">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeSide"
                  className={`${isRtl ? 'mr-auto' : 'ml-auto'} w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]`} 
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-4">
          {/* Pro Status Card */}
          <div className="glass-card p-4 rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.02] relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">SAFERIDE PRO</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed mb-3">AI Vision & Cloud Storage active for your fleet.</p>
              <button className="w-full py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-[9px] font-black uppercase tracking-tighter rounded-lg transition-colors">
                UPGRADE PLAN
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-white/[0.05]" />
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut className={`w-5 h-5 transition-transform group-hover:scale-110 ${isRtl ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium">{lang === 'ar' ? 'تسجيل الخروج' : (lang === 'tr' ? 'Cikis Yap' : 'Logout')}</span>
          </button>
        </div>
      </aside>

      {/* Global AI Alert Overlay */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            className={`fixed bottom-8 ${isRtl ? 'left-8' : 'right-8'} z-[100] w-[400px] glass-card overflow-hidden border-l-4 border-red-500 shadow-2xl bg-black/80 backdrop-blur-2xl`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center animate-pulse">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-red-500">
                      {lang === 'tr' ? 'ACIL DURUM ALARMI' : (lang === 'ar' ? 'تنبيه طوارئ' : 'EMERGENCY ALERT')}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{alert.vehicleId} • {alert.timestamp}</p>
                  </div>
                </div>
                <button onClick={() => setAlert(null)} className="p-1 hover:bg-white/5 rounded-lg">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              
              <div className="space-y-3">
                 <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                    <p className="text-xl font-bold text-white mb-1">
                      {alert.type === 'FATIGUE' ? (lang === 'tr' ? 'Sürücü Yorgunluğu' : 'Driver Fatigue Detected') : 
                       alert.type === 'DISTRACTION' ? (lang === 'tr' ? 'Dikkat Dağınıklığı' : 'Distraction Detected') : alert.label}
                    </p>
                    <p className="text-xs text-slate-400 lowercase">
                      {lang === 'tr' ? 'Sürücü uykulu veya dikkati dağınık görünüyor. Hemen müdahale edin.' : 
                       'Driver appears drowsy or distracted. Immediate intervention required.'}
                    </p>
                 </div>
                 
                 <div className="flex gap-2">
                   <button 
                     onClick={() => { setActiveTab(2); setAlert(null); }}
                     className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                   >
                     {lang === 'tr' ? 'CANLI İZLE' : 'VIEW LIVE'}
                   </button>
                   <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                     {lang === 'tr' ? 'ARA' : 'CALL'}
                   </button>
                 </div>
              </div>
            </div>
            
            {/* Progress Bar for Auto-dismiss */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 8, ease: "linear" }}
              className="h-1 bg-red-500/50" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-white/[0.05] bg-white/[0.01] backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="relative w-96 max-w-sm">
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
            <input 
              type="text" 
              placeholder={lang === 'ar' ? 'بحث عن مركبة، سائق...' : (lang === 'tr' ? 'Arac, surucu ara...' : 'Search vehicles, drivers...')} 
              className={`w-full bg-white/[0.05] border border-white/[0.08] rounded-xl py-2 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm focus:outline-none focus:border-indigo-500/50 transition-colors`}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white/[0.03] rounded-lg p-1 border border-white/5">
              {[
                { code: 'en', label: 'EN' },
                { code: 'tr', label: 'TR' },
                { code: 'ar', label: 'عربي' }
              ].map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${lang === l.code ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white relative group transition-all hover:bg-white/[0.08]">
              <Bell className="w-5 h-5" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 border-2 border-[#050510] group-hover:scale-125 transition-transform" />
            </button>
            <div className="h-8 w-[1px] bg-white/[0.05]" />
            <div className="flex items-center gap-3 px-2 group cursor-pointer">
              <div className={isRtl ? 'text-left' : 'text-right'}>
                <p className="text-xs font-bold text-white uppercase group-hover:text-indigo-400 transition-colors">{user?.name || (lang === 'ar' ? "مدير النظام" : "Admin")}</p>
                <p className="text-[10px] text-slate-500 font-medium">{lang === 'ar' ? "مسؤول عام" : "Global Admin"}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 border border-white/20 p-[2px] group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-[9px] bg-[#050510] flex items-center justify-center font-bold text-xs uppercase">
                  {user?.name?.charAt(0) || "A"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scroll">
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div 
                key="tab0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Welcome Section */}
                <div className="flex items-end justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {user?.role === 'FLEET_MANAGER' 
                        ? (lang === 'tr' ? `Hos geldin, ${user?.name}` : `Welcome, ${user?.name}`)
                        : (lang === 'ar' ? `أهلاً بك، ${user?.name || "المدير"}` : (lang === 'tr' ? `Hos geldin, ${user?.name || "Admin"}` : `Welcome back, ${user?.name || "Admin"}`))} 👋
                    </h1>
                    <p className="text-slate-400 text-sm">
                      {user?.role === 'FLEET_MANAGER' 
                        ? (lang === 'tr' ? `${user?.name} filosunun guncel durumunu izleyin.` : `Monitoring your fleet: ${user?.name}.`)
                        : (lang === 'ar' ? 'يوجد حالياً ١٢ مركبة نشطة في سماء دبي.' : (lang === 'tr' ? 'Seyh Zayed Yolunda 12 arac aktif.' : '12 vehicles active near Sheikh Zayed Road.'))}
                    </p>
                  </div>
                  <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                    <TrendingUp className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'إنشاء تقرير' : (lang === 'tr' ? 'Rapor' : 'Reports')}</span>
                  </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: lang === 'ar' ? "المركبات النشطة" : (lang === 'tr' ? "Aktif Araclar" : "Active Vehicles"), value: "12", sub: "+2 vs last hour", icon: Car, color: "indigo" },
                    { label: lang === 'ar' ? "إجمالي الدخل" : (lang === 'tr' ? "Toplam Gelir" : "Total Revenue"), value: "AED 42.5k", sub: "%15 increase", icon: DollarSign, color: "emerald" },
                    { label: lang === 'ar' ? "الذكاء الاصطناعي" : (lang === 'tr' ? "AI Analizi" : "AI Security"), value: "99.2%", sub: "Dubai SafeCity", icon: ShieldCheck, color: "purple" },
                    { label: lang === 'ar' ? "تنبيهات نشطة" : (lang === 'tr' ? "Aktif Uyari" : "Active Alerts"), value: "3", sub: "Near Downtown", icon: Bell, color: "red" },
                  ].map((stat, i) => (
                    <motion.div 
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.03)" }}
                      className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/[0.03] transition-colors"
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/[0.03] rounded-full translate-x-12 translate-y-[-12px] group-hover:scale-150 transition-all duration-700`} />
                      
                      <div className="flex justify-between items-start relative z-10 mb-4">
                        <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                          <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                        </div>
                        {/* Mini Sparkline Simulation */}
                        <div className="flex items-end gap-1 h-8">
                          {[40, 70, 45, 90, 65, 80].map((h, i) => (
                            <motion.div 
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                              className={`w-1 rounded-full bg-${stat.color}-500/30`} 
                            />
                          ))}
                        </div>
                      </div>

                      <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-white mb-1 flex items-baseline gap-2">
                          {stat.value}
                          {stat.color === 'emerald' && <span className="text-xs text-emerald-400 font-medium">↑</span>}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium">{stat.sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Map & List Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden h-[400px] relative border border-white/[0.03]">
                    <OverviewMap vehicles={vehicles} />
                    
                    {/* Top Regions - High Tech UI */}
                    <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} p-5 bg-[#050510]/95 backdrop-blur-2xl rounded-[2rem] border border-white/[0.08] z-10 w-72 shadow-2xl`}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{lang === 'ar' ? 'تغطية الأسطول' : 'Fleet Coverage'}</p>
                      </div>
                      
                      <div className="space-y-5">
                        {[
                          { name: "Downtown", val: 85, color: "indigo" },
                          { name: "Dubai Marina", val: 62, color: "indigo" },
                          { name: "Business Bay", val: 40, color: "indigo" }
                        ].map(loc => (
                          <div key={loc.name}>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[10px] font-bold text-slate-400">{loc.name}</span>
                              <span className="text-[10px] font-mono text-indigo-400">{loc.val}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[0.5px]">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${loc.val}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                         <div className="flex -space-x-2">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-5 h-5 rounded-full border border-[#050510] bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">?</div>
                            ))}
                         </div>
                         <p className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">+12 DRIVERS IN DUBAI</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-6 flex flex-col h-[400px] border border-white/[0.03]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-white">{lang === 'ar' ? 'آخر النشاطات' : 'Recent Activity'}</h3>
                      <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">{lang === 'ar' ? 'الكل' : 'All'}</button>
                    </div>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scroll">
                      {[
                        { title: "DXB 5521", desc: lang === 'ar' ? "بدأت رحلة جديدة من المطار" : "New trip started from Airport", time: "Just now", color: "indigo" },
                        { title: lang === 'ar' ? "أحمد م." : "Ahmed M.", desc: lang === 'ar' ? "تسجيل دخول" : "Logged in", time: "5m", color: "indigo" },
                        { title: "DIFC Unit", desc: lang === 'ar' ? "تنبيه سرعة زائدة" : "Speed alert detected", time: "12m", urgent: true },
                        { title: "DXB 9982", desc: lang === 'ar' ? "رحلة منteية" : "Trip completed at Marina", time: "18m", color: "emerald" },
                      ].map((act, i) => (
                        <div key={i} className="flex gap-4 group cursor-pointer p-2 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.03]">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:rotate-6 ${act.urgent ? 'bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-white/[0.05] border border-white/[0.08]'}`}>
                            {act.urgent ? <ShieldAlert className="w-4 h-4 text-red-500" /> : <Activity className="w-4 h-4 text-indigo-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                              <p className={`text-xs font-black truncate transition-colors ${act.urgent ? 'text-red-400' : 'text-white'}`}>{act.title}</p>
                              <span className="text-[9px] text-slate-500 font-mono">{act.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1 group-hover:text-slate-400 transition-colors uppercase font-bold tracking-tighter">{act.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div 
                key="tab1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">{lang === 'ar' ? 'إدارة المركبات' : (lang === 'tr' ? 'Arac Yonetimi' : 'Vehicle Management')}</h2>
                  <button className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-bold">+ {lang === 'ar' ? 'إضافة مركبة' : 'Add Vehicle'}</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { plate: "DXB 1234", model: "BYD Atto 3", battery: "85%", range: "350 km" },
                    { plate: "SHJ 9988", model: "BYD Han", battery: "92%", range: "510 km" },
                    { plate: "DXB 5500", model: "BYD Seal", battery: "45%", range: "240 km" },
                    { plate: "AJM 1122", model: "BYD Tang", battery: "78%", range: "310 km" },
                    { plate: "DXB 7766", model: "BYD Dolphin", battery: "12%", range: "45 km", low: true },
                  ].map(v => (
                    <div key={v.plate} className="glass-card p-6 rounded-2xl border border-white/[0.03] group hover:border-indigo-500/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-white/[0.05] group-hover:bg-indigo-500/10 transition-colors">
                          <Car className="w-6 h-6 text-indigo-400" />
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${v.low ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {v.low ? 'LOW BATTERY' : 'ACTIVE'}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">{v.plate}</h4>
                      <p className="text-xs text-slate-500 mb-4">{v.model}</p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-500 uppercase">Battery</span>
                          <span className={v.low ? 'text-red-400' : 'text-emerald-400'}>{v.battery}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: v.battery }}
                            className={`h-full ${v.low ? 'bg-red-500' : 'bg-indigo-500'}`}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">{v.range} estimated range</p>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 py-2 rounded-lg bg-white/[0.05] text-xs font-bold hover:bg-white/[0.1] transition-all">Track</button>
                        <button className="flex-1 py-2 rounded-lg bg-white/[0.05] text-xs font-bold hover:bg-white/[0.1] transition-all">Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div 
                key="tab2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <LiveTracking lang={lang} />
              </motion.div>
            )}


            {activeTab === 3 && (
              <motion.div 
                key="tab3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 flex flex-col h-full"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">{lang === 'ar' ? 'سجل الرحلات' : (lang === 'tr' ? 'Yolculuk Gecmisi' : 'Trip History')}</h2>
                  {selectedTrip && (
                    <button 
                      onClick={() => setSelectedTrip(null)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {lang === 'tr' ? 'Listeye Don' : 'Back to List'}
                    </button>
                  )}
                </div>

                <div className="flex-1 min-h-0">
                  <AnimatePresence mode="wait">
                    {!selectedTrip ? (
                      <motion.div 
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-card rounded-[2rem] border border-white/[0.03] overflow-hidden shadow-2xl"
                      >
                        <table className="w-full text-left">
                          <thead className="bg-[#0c0c1e] border-b border-white/[0.05]">
                            <tr>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'المركبة' : 'Vehicle'}</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'السائق' : 'Driver'}</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'الوجهة' : 'To'}</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'التكلفة' : 'Cost'}</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.03]">
                            {[1, 2, 3, 4, 5].map(i => (
                              <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-6 text-sm font-black text-white uppercase tracking-tighter">DXB {1000 + i * 23}</td>
                                <td className="px-8 py-6 text-sm text-slate-400 font-medium">Driver {i}</td>
                                <td className="px-8 py-6 text-sm text-slate-400 font-medium">Dubai Mall / Marina</td>
                                <td className="px-8 py-6 text-sm font-black text-emerald-400 font-mono">AED {40 + i * 15}.00</td>
                                <td className="px-8 py-6 text-right">
                                   <button 
                                     onClick={() => setSelectedTrip({ id: i, route: [[25.2048, 55.2708], [25.0717, 55.1389]] })}
                                     className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                                   >
                                     View Route
                                   </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="map"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="h-[500px] glass-card rounded-[2rem] overflow-hidden border border-white/[0.08] relative shadow-2xl shadow-indigo-500/10"
                      >
                         <HistoryMap route={selectedTrip.route} />
                         
                         <div className="absolute bottom-6 left-6 p-6 bg-[#050510]/90 backdrop-blur-2xl rounded-2xl border border-white/10 z-10 w-80">
                            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-4">Route Replay</h4>
                            <div className="space-y-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">START: Dubai International Airport</p>
                               </div>
                               <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">END: Dubai Marina District</p>
                               </div>
                               
                               <div className="pt-4 border-t border-white/5 space-y-3">
                                  <div className="flex justify-between text-[10px] font-black uppercase">
                                     <span className="text-slate-500">Distance</span>
                                     <span className="text-white">32.4 KM</span>
                                  </div>
                                  <div className="flex justify-between text-[10px] font-black uppercase">
                                     <span className="text-slate-500">Safety Score</span>
                                     <span className="text-emerald-400">98/100</span>
                                  </div>
                               </div>
                               
                               <button className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                                  Play Animation
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 4 && (
              <motion.div 
                key="tab4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl space-y-8"
              >
                <h2 className="text-2xl font-bold text-white">{lang === 'ar' ? 'الإعدادات' : (lang === 'tr' ? 'Ayarlar' : 'Settings')}</h2>
                <div className="space-y-4">
                  {[
                     { label: lang === 'ar' ? 'إعدادات الحساب' : 'Account Settings', icon: Users },
                     { label: lang === 'ar' ? 'تنبيهات النظام' : 'System Alerts', icon: Bell },
                     { label: lang === 'ar' ? 'أمان البيانات' : 'Data Security', icon: ShieldAlert },
                     { label: lang === 'ar' ? 'الفوترة' : 'Billing', icon: DollarSign },
                  ].map(set => (
                    <button key={set.label} className="w-full glass-card p-5 rounded-2xl flex items-center justify-between border border-white/[0.03] hover:bg-white/[0.05] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-indigo-500/10"><set.icon className="w-5 h-5 text-indigo-400" /></div>
                        <span className="font-bold text-white">{set.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Map component with Dynamic SSR handling
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

function OverviewMap({ vehicles }: { vehicles: Record<string, any> }) {
  // Dubai Default
  const position: [number, number] = [25.2048, 55.2708];

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={position} 
        zoom={12} 
        style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {Object.values(vehicles).map((v: any) => (
          v.position && (
            <Marker 
              key={v.vehicleId} 
              position={[v.position.lat, v.position.lng]}
            />
          )
        ))}
      </MapContainer>
    </div>
  );
}

function HistoryMap({ route }: { route: [number, number][] }) {
  const center: [number, number] = route[0];

  return (
    <div className="h-full w-full">
      <MapContainer 
        center={center} 
        zoom={11} 
        style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline 
          positions={route} 
          color="#6366f1" 
          weight={4} 
          opacity={0.8}
          dashArray="10, 10"
        />
        <Marker position={route[0]}>
           <Popup>Start Point</Popup>
        </Marker>
        <Marker position={route[route.length - 1]}>
           <Popup>End Point</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
