"use client";

import { useState } from "react";
import { MapPin, Search, Car, Clock, DollarSign } from "lucide-react";
import { useLang } from "../../../lib/admin-context";
import AdminTopbar from "../../../components/admin/AdminTopbar";
import StatusBadge from "../../../components/admin/StatusBadge";
import { mockTrips, MockTrip } from "../../../lib/mock-data";

const titles = { en: 'Trip Management', tr: 'Sefer Yönetimi', ar: 'إدارة الرحلات' };

export default function TripsPage() {
  const { lang, setLang, isRtl } = useLang();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filtered = mockTrips.filter(t => {
    const matchSearch = t.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName.toLowerCase().includes(search.toLowerCase()) ||
      t.startAddress.toLowerCase().includes(search.toLowerCase()) ||
      t.endAddress.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchDate = !dateFilter || t.date === dateFilter;
    return matchSearch && matchStatus && matchDate;
  });

  const totalFare = filtered.filter(t => t.status === 'COMPLETED').reduce((s, t) => s + t.fare, 0);
  const activeCount = filtered.filter(t => t.status === 'ACTIVE').length;
  const completedCount = filtered.filter(t => t.status === 'COMPLETED').length;

  return (
    <>
      <AdminTopbar lang={lang} setLang={setLang} title={titles[lang]} isRtl={isRtl} />

      <div className="p-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-5 rounded-2xl border border-white/[0.03] bg-white/[0.02] flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'tr' ? 'Aktif' : lang === 'ar' ? 'نشط' : 'Active'}</p>
              <p className="text-xl font-bold text-white">{activeCount}</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-white/[0.03] bg-white/[0.02] flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'tr' ? 'Tamamlanan' : lang === 'ar' ? 'مكتمل' : 'Completed'}</p>
              <p className="text-xl font-bold text-white">{completedCount}</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-white/[0.03] bg-white/[0.02] flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'tr' ? 'Toplam Gelir' : lang === 'ar' ? 'الإيرادات' : 'Revenue'}</p>
              <p className="text-xl font-bold text-white">AED {totalFare}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center mb-8">
          <div className="relative w-80">
            <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث...' : lang === 'tr' ? 'Ara...' : 'Search...'}
              className={`w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-medium`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3 px-5 text-sm text-slate-300 font-bold focus:outline-none focus:border-indigo-500/50 appearance-none"
          >
            <option value="ALL" className="bg-[#0c0c1e]">{lang === 'tr' ? 'Tümü' : lang === 'ar' ? 'الكل' : 'All Status'}</option>
            <option value="REQUESTED" className="bg-[#0c0c1e]">Requested</option>
            <option value="ACTIVE" className="bg-[#0c0c1e]">Active</option>
            <option value="COMPLETED" className="bg-[#0c0c1e]">Completed</option>
            <option value="CANCELLED" className="bg-[#0c0c1e]">Cancelled</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3 px-5 text-sm text-slate-300 font-bold focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* Table */}
        <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500" />
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0c0c1e] border-b border-white/[0.05]">
              <tr>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">ID</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Sürücü / Araç' : lang === 'ar' ? 'السائق / المركبة' : 'Driver / Vehicle'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Güzergah' : lang === 'ar' ? 'المسار' : 'Route'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Süre / Mesafe' : lang === 'ar' ? 'المدة / المسافة' : 'Duration / Dist.'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Ücret' : lang === 'ar' ? 'الأجرة' : 'Fare'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Durum' : lang === 'ar' ? 'الحالة' : 'Status'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <span className="text-xs font-mono font-bold text-indigo-400">{t.id}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t.date}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-white">{t.driverName}</p>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-black border border-indigo-500/20">{t.vehiclePlate}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div className="w-0.5 h-6 bg-white/10" />
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-300 font-medium">{t.startAddress}</p>
                        <p className="text-xs text-slate-500 mt-2">{t.endAddress}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{t.duration}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{t.distance}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-white">AED {t.fare}</span>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-slate-500 text-sm">
                    {lang === 'tr' ? 'Sefer bulunamadı.' : lang === 'ar' ? 'لم يتم العثور على رحلات.' : 'No trips found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 px-4">
          <p className="text-[11px] text-slate-500 font-bold">
            {filtered.length} {lang === 'tr' ? 'sefer' : lang === 'ar' ? 'رحلة' : 'trips'}
          </p>
        </div>
      </div>
    </>
  );
}
