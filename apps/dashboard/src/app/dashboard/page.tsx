"use client";

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
  Users
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState(0);
  const isRtl = lang === 'ar';

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
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
  ];

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
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight gradient-text-peng">PENG</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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

        <div className="p-4 mt-auto border-t border-white/[0.05]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut className={`w-5 h-5 transition-transform group-hover:scale-110 ${isRtl ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium">{lang === 'ar' ? 'تسجيل الخروج' : (lang === 'tr' ? 'Cikis Yap' : 'Logout')}</span>
          </button>
        </div>
      </aside>

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
                      {lang === 'ar' ? `أهلاً بك، ${user?.name || "المدير"}` : (lang === 'tr' ? `Hos geldin, ${user?.name || "Admin"}` : `Welcome back, ${user?.name || "Admin"}`)} 👋
                    </h1>
                    <p className="text-slate-400 text-sm">
                      {lang === 'ar' ? 'يوجد حالياً ١٢ مركبة نشطة في سماء دبي.' : (lang === 'tr' ? 'Seyh Zayed Yolunda 12 arac aktif.' : '12 vehicles active near Sheikh Zayed Road.')}
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
                    { label: lang === 'ar' ? "المركبات النشطة" : "Active Vehicles", value: "12", sub: "+2 vs last hour" },
                    { label: lang === 'ar' ? "إجمالي الدخل" : "Total Revenue", value: "AED 42,500", sub: "%15 increase" },
                    { label: lang === 'ar' ? "متوسط السرعة" : "Avg speed", value: "75 km/h", sub: "Dubai Limits" },
                    { label: lang === 'ar' ? "تنبيهات نشطة" : "Active Alerts", value: "3", sub: "Near Downtown" },
                  ].map((stat) => (
                    <motion.div 
                      key={stat.label}
                      whileHover={{ y: -4 }}
                      className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/[0.03]"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.03] rounded-full translate-x-8 translate-y-[-8px] group-hover:scale-150 transition-all duration-500" />
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                      <p className="text-xs text-slate-400">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Map & List Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden h-[400px] relative border border-white/[0.03]">
                    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center opacity-40">
                      <MapIcon className="w-12 h-12 text-slate-700 mb-4" />
                      <p className="text-slate-600 text-sm font-medium italic">{lang === 'ar' ? 'تحميل خريطة دبي...' : 'Loading Dubai Map...'}</p>
                    </div>
                    <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} p-4 bg-[#050510]/80 backdrop-blur-md rounded-2xl border border-white/[0.05] z-10 w-64`}>
                      <p className="text-xs font-bold text-white mb-3 uppercase tracking-wider">{lang === 'ar' ? 'مواقع الأسطول النشط' : 'Active Fleet Locations'}</p>
                      <div className="space-y-4">
                        {["Downtown", "Marina", "Business Bay"].map(loc => (
                          <div key={loc} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse" />
                            <div className="flex-1">
                              <p className="text-[10px] text-slate-400 mb-1 font-bold">{loc}</p>
                              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.random() * 100}%` }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                  className="h-full bg-indigo-500" 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
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
                        { title: lang === 'ar' ? "أحمد م." : "Ahmed M.", desc: lang === 'ar' ? "تسجيل دخول" : "Logged in", time: "5m", color: "purple" },
                        { title: "DIFC Unit", desc: lang === 'ar' ? "تنبيه سرعة زائدة" : "Speed alert detected", time: "12m", urgent: true },
                        { title: "DXB 9982", desc: lang === 'ar' ? "رحلة منتهية" : "Trip completed at Marina", time: "18m", color: "emerald" },
                        { title: "Jumeirah Unit", desc: lang === 'ar' ? "منطقة محدودة" : "Restricted zone entry", time: "25m", urgent: true },
                      ].map((act, i) => (
                        <div key={i} className="flex gap-4 group">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${act.urgent ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/[0.05] border border-white/[0.08]'}`}>
                            {act.urgent ? <Bell className="w-4 h-4 text-red-500" /> : <Activity className="w-4 h-4 text-indigo-500" />}
                          </div>
                          <div className={`flex-1 border-b border-white/[0.05] pb-4 group-last:border-0`}>
                            <div className="flex justify-between items-start mb-1">
                              <p className={`text-sm font-bold transition-colors ${act.urgent ? 'text-red-400 group-hover:text-red-300' : 'text-white group-hover:text-indigo-300'}`}>{act.title}</p>
                              <span className="text-[10px] text-slate-500 font-medium">{act.time}</span>
                            </div>
                            <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">{act.desc}</p>
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full flex flex-col space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">{lang === 'ar' ? 'التتبع المباشر' : (lang === 'tr' ? 'Canli Takip' : 'Live Tracking')}</h2>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      12 ONLINE
                    </div>
                  </div>
                </div>
                <div className="flex-1 glass-card rounded-3xl border border-white/[0.03] overflow-hidden relative min-h-[500px]">
                  <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 font-bold tracking-widest uppercase">Initializing Radar System...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 3 && (
              <motion.div 
                key="tab3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">{lang === 'ar' ? 'سجل الرحلات' : (lang === 'tr' ? 'Yolculuk Gecmisi' : 'Trip History')}</h2>
                </div>
                <div className="glass-card rounded-2xl border border-white/[0.03] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/[0.02] border-b border-white/[0.05]">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{lang === 'ar' ? 'المركبة' : 'Vehicle'}</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{lang === 'ar' ? 'السائق' : 'Driver'}</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{lang === 'ar' ? 'الوجهة' : 'To'}</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{lang === 'ar' ? 'التكلفة' : 'Cost'}</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {[1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="px-6 py-4 text-sm font-bold text-white">DXB {1000 + i * 23}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">Driver {i}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">Dubai Mall</td>
                          <td className="px-6 py-4 text-sm font-bold text-indigo-400">AED {40 + i * 15}.00</td>
                          <td className="px-6 py-4 text-right">
                             <button className="p-2 rounded-lg bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-all"><ChevronRight className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
