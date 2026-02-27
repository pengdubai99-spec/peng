"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Car, 
  Users, 
  UserPlus, 
  Plus, 
  Trash2, 
  Edit, 
  ChevronRight, 
  LayoutDashboard,
  Save,
  X,
  ShieldCheck,
  Search,
  Bell,
  Navigation,
  Cpu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { translations, Language } from "../../lib/i18n";

export default function AdminPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('en');
  const [activeMenu, setActiveMenu] = useState<'vehicles' | 'drivers' | 'partners'>('vehicles');
  const [showAddModal, setShowAddModal] = useState(false);
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // State for data
  const [vehicles, setVehicles] = useState([
    { id: 1, plate: "DXB 1234", model: "BYD Atto 3", fleet: "Skyline Logistics" },
    { id: 2, plate: "SHJ 9988", model: "BYD Han", fleet: "Desert Fleet Co" },
  ]);

  const [drivers, setDrivers] = useState([
    { id: 1, name: "Ahmed Mansoor", license: "DXB-99221", phone: "+971 50 123 4567" },
    { id: 2, name: "Sarah Al-Farsi", license: "DIFC-88110", phone: "+971 55 987 6543" },
  ]);

  const [partners, setPartners] = useState([
    { id: 1, name: "Skyline Logistics", email: "info@skyline.ae", vehicles: 5, tracking: true, camera: true, accessKey: "PENG-SK-2026" },
    { id: 2, name: "Desert Fleet Co", email: "ops@desertfleet.com", vehicles: 12, tracking: true, camera: false, accessKey: "PENG-DF-2026" },
  ]);

  const [formData, setFormData] = useState<any>({});

  const handleAdd = () => {
    if (activeMenu === 'vehicles') {
      const newVehicle = {
        id: Date.now(),
        plate: formData.plate || "DXB-NEW",
        model: formData.model || "BYD E-Series",
        battery: formData.battery || "75kWh",
        fleet: formData.partnerName || "Independent",
      };
      setVehicles([...vehicles, newVehicle]);
    } else if (activeMenu === 'drivers') {
      const newDriver = {
        id: Date.now(),
        name: formData.name || "New Driver",
        license: formData.license || "LIC-000",
        phone: formData.phone || "+971...",
        status: "Active",
      };
      setDrivers([...drivers, newDriver]);
    } else if (activeMenu === 'partners') {
       const newPartner = {
         id: Date.now(),
         name: formData.name || "New Partner",
         email: formData.email || "",
         vehicles: 0,
         tracking: formData.tracking || false,
         camera: formData.camera || false,
         accessKey: `PENG-ID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
       };
       setPartners([...partners, newPartner]);
    }
    setShowAddModal(false);
    setFormData({});
  };

  const adminMenuItems = [
    { id: 'vehicles', icon: Car, label: lang === 'tr' ? "Arac Yönetimi" : (lang === 'ar' ? "إدارة المركبات" : "Vehicles") },
    { id: 'drivers', icon: Users, label: lang === 'tr' ? "Sürücü Yönetimi" : (lang === 'ar' ? "إدارة السائقين" : "Drivers") },
    { id: 'partners', icon: UserPlus, label: lang === 'tr' ? "Filo Ortakları" : (lang === 'ar' ? "شركاء الأسطول" : "Fleet Partners") },
  ];

  return (
    <div className={`flex min-h-screen bg-[#050510] text-[#f0f0ff] font-['Outfit'] ${isRtl ? 'font-["IBM_Plex_Sans_Arabic"] flex-row-reverse' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar */}
      <aside className={`w-64 border-x border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl flex flex-col relative z-20 ${isRtl ? 'border-l' : 'border-r'}`}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight gradient-text-peng">PENG</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
           {adminMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                activeMenu === item.id 
                  ? "bg-white/[0.08] text-white shadow-xl shadow-indigo-500/5 border border-white/[0.05]" 
                  : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeMenu === item.id ? 'text-indigo-400' : ''}`} />
              <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-4">
          <div className="glass-card p-4 rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.02] relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">SYSTEM STATUS</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed mb-3">All nodes operational in Dubai South.</p>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              </div>
            </div>
          </div>

          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-white transition-all text-xs font-black uppercase tracking-widest border border-white/5"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{lang === 'ar' ? 'لوحة المراقبة' : (lang === 'tr' ? 'DASHBOARD' : 'DASHBOARD')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Topbar */}
        <header className="h-20 border-b border-white/[0.05] bg-white/[0.01] backdrop-blur-md flex items-center justify-between px-10">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {activeMenu === 'vehicles' ? t.addVehicle : (activeMenu === 'drivers' ? t.addDriver : (t as any).addPartner)}
          </h2>

          <div className="flex items-center gap-6">
             <div className="flex bg-white/[0.03] rounded-xl p-1 border border-white/5">
              {(['en', 'tr', 'ar'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${lang === l ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            
            <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center cursor-pointer hover:bg-white/[0.1] transition-all">
              <Bell className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-10">
          <div className="flex justify-between items-center mb-10">
            <div className="relative w-96">
              <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
              <input 
                type="text" 
                placeholder={lang === 'ar' ? 'بحث...' : 'Search...'} 
                className={`w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-medium`}
              />
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>{activeMenu === 'vehicles' ? t.addVehicle : (activeMenu === 'drivers' ? t.addDriver : (t as any).addPartner)}</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
             {[
               { label: "Active Nodes", val: "24", icon: Cpu, color: "indigo" },
               { label: "Fleet Capacity", val: "150+", icon: Car, color: "purple" },
               { label: "Partner Trust", val: "100%", icon: ShieldCheck, color: "emerald" }
             ].map((s, i) => (
                <div key={i} className="glass-card p-6 rounded-3xl border border-white/[0.03] flex items-center gap-4 group">
                   <div className={`w-12 h-12 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center border border-${s.color}-500/20 group-hover:scale-110 transition-transform`}>
                     <s.icon className={`w-6 h-6 text-${s.color}-400`} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                     <p className="text-2xl font-bold text-white">{s.val}</p>
                   </div>
                </div>
             ))}
          </div>

          {/* Table */}
          <div className="glass-card rounded-[40px] border border-white/[0.05] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x" />
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0c0c1e] border-b border-white/[0.05]">
                {activeMenu === 'vehicles' ? (
                  <tr>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">{t.plateNumber}</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">{t.vehicleModel}</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">{t.assignPartner}</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px] text-right">Actions</th>
                  </tr>
                ) : activeMenu === 'drivers' ? (
                  <tr>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">Full Name</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">License ID</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">Contact Info</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px] text-right">Actions</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">{t.adminTitle}</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">Security Key</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">Access Rights</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px] text-right">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {activeMenu === 'vehicles' ? vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center"><Navigation className="w-5 h-5 text-indigo-400 rotate-45" /></div>
                        <span className="text-sm font-bold text-white tracking-wide">{v.plate}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-400 font-medium">{v.model}</td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black border border-indigo-500/20">{v.fleet}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-indigo-500/20 hover:text-indigo-400 transition-all"><Edit className="w-4 h-4" /></button>
                        <button className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-red-500/20 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )) : activeMenu === 'drivers' ? drivers.map(d => (
                   <tr key={d.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center font-bold text-purple-400">{d.name.charAt(0)}</div>
                        <span className="text-sm font-bold text-white tracking-wide">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-400 font-medium">{d.license}</td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-mono italic">{d.phone}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-indigo-500/20 hover:text-indigo-400 transition-all"><Edit className="w-4 h-4" /></button>
                        <button className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-red-500/20 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )) : partners.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400">{p.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-bold text-white tracking-wide">{p.name}</p>
                          <p className="text-[10px] text-slate-500">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <code className="text-[10px] font-black text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10">{p.accessKey}</code>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        {p.tracking && <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[9px] font-black border border-blue-500/20">GPS</span>}
                        {p.camera && <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 text-[9px] font-black border border-pink-500/20">VIDEO</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-indigo-500/20 hover:text-indigo-400 transition-all"><Edit className="w-4 h-4" /></button>
                        <button className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-red-500/20 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-[#050510]/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0c0c1e] border border-white/10 rounded-[32px] p-10 shadow-3xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white">{activeMenu === 'vehicles' ? t.addVehicle : (activeMenu === 'drivers' ? t.addDriver : (t as any).addPartner)}</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-500"><X /></button>
              </div>

              <div className="space-y-6">
                {activeMenu === 'vehicles' ? (
                  <>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.plateNumber}</label>
                       <input 
                         type="text" 
                         value={formData.plate || ''}
                         onChange={(e) => setFormData({...formData, plate: e.target.value})}
                         placeholder="DXB 0000" 
                         className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 focus:border-indigo-500/50 outline-none text-white font-bold transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.vehicleModel}</label>
                       <input 
                         type="text" 
                         value={formData.model || ''}
                         onChange={(e) => setFormData({...formData, model: e.target.value})}
                         placeholder="BYD Model X" 
                         className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 focus:border-indigo-500/50 outline-none text-white font-bold transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.assignPartner}</label>
                       <select 
                         value={formData.partnerName || ''}
                         onChange={(e) => setFormData({...formData, partnerName: e.target.value})}
                         className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 focus:border-indigo-500/50 outline-none text-white font-bold transition-all appearance-none"
                       >
                         <option value="" className="bg-[#0c0c1e]">Independent</option>
                         {partners.map(p => (
                           <option key={p.id} value={p.name} className="bg-[#0c0c1e]">{p.name}</option>
                         ))}
                       </select>
                    </div>
                  </>
                ) : activeMenu === 'drivers' ? (
                  <>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                       <input 
                         type="text" 
                         value={formData.name || ''}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         placeholder="Ad Soyad" 
                         className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 focus:border-indigo-500/50 outline-none text-white font-bold transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">License / ID</label>
                       <input 
                         type="text" 
                         value={formData.license || ''}
                         onChange={(e) => setFormData({...formData, license: e.target.value})}
                         placeholder="DXB-123..." 
                         className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 focus:border-indigo-500/50 outline-none text-white font-bold transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Phone Number</label>
                       <input 
                         type="text" 
                         value={formData.phone || ''}
                         onChange={(e) => setFormData({...formData, phone: e.target.value})}
                         placeholder="+971..." 
                         className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 focus:border-indigo-500/50 outline-none text-white font-bold transition-all" 
                       />
                    </div>
                  </>
                ) : (
                   <>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Partner / Agency Name</label>
                       <input 
                         type="text" 
                         value={formData.name || ''}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         placeholder="Company Name" 
                         className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 focus:border-indigo-500/50 outline-none text-white font-bold transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                       <input 
                         type="email" 
                         value={formData.email || ''}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         placeholder="contact@agency.ae" 
                         className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 px-6 focus:border-indigo-500/50 outline-none text-white font-bold transition-all" 
                       />
                    </div>
                    
                    <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <label className="flex-1 flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.tracking || false}
                          onChange={(e) => setFormData({...formData, tracking: e.target.checked})}
                          className="w-4 h-4 accent-indigo-500"
                        />
                        <span className="text-[10px] font-bold text-slate-400">{t.trackingAccess}</span>
                      </label>
                      <label className="flex-1 flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.camera || false}
                          onChange={(e) => setFormData({...formData, camera: e.target.checked})}
                          className="w-4 h-4 accent-pink-500"
                        />
                        <span className="text-[10px] font-bold text-slate-400">{t.cameraAccess}</span>
                      </label>
                    </div>
                  </>
                )}

                <div className="flex gap-4 mt-10">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-400 font-bold hover:bg-white/[0.05] transition-all"
                  >{t.cancel}</button>
                  <button 
                    onClick={handleAdd}
                    className="flex-2 py-4 px-10 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20"
                  >
                    <Save className="w-5 h-5" />
                    <span>{t.save}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
