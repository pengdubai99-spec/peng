"use client";

import { Car, Users, MapPin, DollarSign, CheckCircle, UserCheck, AlertTriangle, UserPlus, Plus, Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLang } from "../../lib/admin-context";
import AdminTopbar from "../../components/admin/AdminTopbar";
import StatsCard from "../../components/admin/StatsCard";
import { mockVehicles, mockDrivers, mockTrips, mockFleets, mockRecentActivity } from "../../lib/mock-data";

const titles = { en: 'Dashboard', tr: 'Gösterge Paneli', ar: 'لوحة القيادة' };

export default function AdminDashboardPage() {
  const { lang, setLang, isRtl } = useLang();
  const router = useRouter();

  const activeVehicles = mockVehicles.filter(v => v.status === 'ACTIVE').length;
  const onlineDrivers = mockDrivers.filter(d => d.status === 'ONLINE' || d.status === 'ON_TRIP').length;
  const todayTrips = mockTrips.filter(t => t.date === '2026-02-28').length;
  const totalRevenue = mockTrips.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + t.fare, 0);

  const activityIcons: Record<string, any> = {
    check: CheckCircle,
    user: UserCheck,
    alert: AlertTriangle,
    car: Car,
    partner: UserPlus,
  };

  const quickActions = [
    { label: lang === 'tr' ? 'Araç Ekle' : lang === 'ar' ? 'إضافة مركبة' : 'Add Vehicle', icon: Car, path: '/admin/vehicles' },
    { label: lang === 'tr' ? 'Sürücü Ekle' : lang === 'ar' ? 'إضافة سائق' : 'Add Driver', icon: Users, path: '/admin/drivers' },
    { label: lang === 'tr' ? 'Canlı İzleme' : lang === 'ar' ? 'المراقبة الحية' : 'Live Monitor', icon: Radio, path: '/admin/monitoring' },
  ];

  return (
    <>
      <AdminTopbar lang={lang} setLang={setLang} title={titles[lang]} isRtl={isRtl} />

      <div className="p-10 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label={lang === 'tr' ? 'Aktif Araçlar' : lang === 'ar' ? 'المركبات النشطة' : 'Active Vehicles'}
            value={activeVehicles}
            icon={Car}
            color="indigo"
            trend={`/${mockVehicles.length}`}
          />
          <StatsCard
            label={lang === 'tr' ? 'Çevrimiçi Sürücüler' : lang === 'ar' ? 'السائقون المتصلون' : 'Online Drivers'}
            value={onlineDrivers}
            icon={Users}
            color="purple"
            trend={`/${mockDrivers.length}`}
          />
          <StatsCard
            label={lang === 'tr' ? 'Bugünkü Seferler' : lang === 'ar' ? 'رحلات اليوم' : 'Trips Today'}
            value={todayTrips}
            icon={MapPin}
            color="emerald"
          />
          <StatsCard
            label={lang === 'tr' ? 'Toplam Gelir' : lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
            value={`AED ${totalRevenue}`}
            icon={DollarSign}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 rounded-[32px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-white/[0.05]">
              <h3 className="text-lg font-black text-white">
                {lang === 'tr' ? 'Son Aktivite' : lang === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
              </h3>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {mockRecentActivity.map(activity => {
                const Icon = activityIcons[activity.icon] || CheckCircle;
                return (
                  <div key={activity.id} className="px-8 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      activity.type === 'alert' ? 'bg-amber-500/10' : 'bg-indigo-500/10'
                    }`}>
                      <Icon className={`w-4 h-4 ${activity.type === 'alert' ? 'text-amber-400' : 'text-indigo-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 font-medium truncate">{activity.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions + Fleet Summary */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-[32px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">
                {lang === 'tr' ? 'Hızlı Eylemler' : lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
              </h3>
              <div className="space-y-3">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(action.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-300 hover:bg-indigo-500/10 hover:border-indigo-500/20 hover:text-white transition-all text-sm font-bold"
                  >
                    <action.icon className="w-4 h-4 text-indigo-400" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fleet Overview */}
            <div className="rounded-[32px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">
                {lang === 'tr' ? 'Filo Ortakları' : lang === 'ar' ? 'شركاء الأسطول' : 'Fleet Partners'}
              </h3>
              <div className="space-y-3">
                {mockFleets.map(fleet => (
                  <div key={fleet.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      fleet.status === 'Active' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {fleet.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{fleet.name}</p>
                      <p className="text-[10px] text-slate-500">{fleet.vehicleCount} vehicles</p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400">{fleet.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
