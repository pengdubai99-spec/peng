"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Users,
  UserPlus,
  MapPin,
  Radio,
  Settings,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { Language, translations } from "../../lib/i18n";

interface AdminSidebarProps {
  lang: Language;
}

const navItems = [
  { path: '/admin', icon: LayoutDashboard, labelKey: 'dashboard' },
  { path: '/admin/vehicles', icon: Car, labelKey: 'vehicles' },
  { path: '/admin/drivers', icon: Users, labelKey: 'drivers' },
  { path: '/admin/fleets', icon: UserPlus, labelKey: 'fleets' },
  { path: '/admin/trips', icon: MapPin, labelKey: 'trips' },
  { path: '/admin/monitoring', icon: Radio, labelKey: 'liveMonitoring' },
  { path: '/admin/settings', icon: Settings, labelKey: 'settings' },
];

const navLabels: Record<string, Record<Language, string>> = {
  dashboard: { en: 'Dashboard', tr: 'Gösterge Paneli', ar: 'لوحة القيادة' },
  vehicles: { en: 'Vehicles', tr: 'Araçlar', ar: 'المركبات' },
  drivers: { en: 'Drivers', tr: 'Sürücüler', ar: 'السائقون' },
  fleets: { en: 'Fleet Partners', tr: 'Filo Ortakları', ar: 'شركاء الأسطول' },
  trips: { en: 'Trips', tr: 'Seferler', ar: 'الرحلات' },
  liveMonitoring: { en: 'Live Monitoring', tr: 'Canlı İzleme', ar: 'المراقبة الحية' },
  settings: { en: 'Settings', tr: 'Ayarlar', ar: 'الإعدادات' },
};

export default function AdminSidebar({ lang }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isRtl = lang === 'ar';

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  return (
    <aside className={`w-64 border-x border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl flex flex-col relative z-20 ${isRtl ? 'border-l' : 'border-r'}`}>
      {/* Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">PENG</span>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${
              isActive(item.path)
                ? "bg-white/[0.08] text-white shadow-xl shadow-indigo-500/5 border border-white/[0.05]"
                : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-indigo-400' : ''}`} />
            <span className="text-sm font-bold uppercase tracking-wider">{navLabels[item.labelKey][lang]}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 mt-auto space-y-4">
        {/* System Status */}
        <div className="p-4 rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.02] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {lang === 'tr' ? 'SİSTEM DURUMU' : lang === 'ar' ? 'حالة النظام' : 'SYSTEM STATUS'}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 leading-relaxed mb-3">
              {lang === 'tr' ? 'Tüm düğümler aktif.' : lang === 'ar' ? 'جميع العقد نشطة.' : 'All nodes operational.'}
            </p>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="w-full h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-white transition-all text-xs font-black uppercase tracking-widest border border-white/5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{lang === 'tr' ? 'DASHBOARD' : lang === 'ar' ? 'لوحة المراقبة' : 'DASHBOARD'}</span>
        </button>
      </div>
    </aside>
  );
}
