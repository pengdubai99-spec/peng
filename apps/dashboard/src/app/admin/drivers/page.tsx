"use client";

import { useState } from "react";
import { Users, Plus, Edit, Trash2, Search, Star } from "lucide-react";
import { useLang } from "../../../lib/admin-context";
import AdminTopbar from "../../../components/admin/AdminTopbar";
import StatusBadge from "../../../components/admin/StatusBadge";
import EntityModal, { FieldConfig } from "../../../components/admin/EntityModal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import { mockDrivers, MockDriver, mockVehicles } from "../../../lib/mock-data";

const titles = { en: 'Driver Management', tr: 'Sürücü Yönetimi', ar: 'إدارة السائقين' };

const availableVehicles = mockVehicles.map(v => ({ value: v.plateNumber, label: `${v.plateNumber} - ${v.brand} ${v.model}` }));

const driverFields: FieldConfig[] = [
  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Ahmed Mansoor' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'driver@company.ae' },
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+971 50 000 0000' },
  { key: 'licenseNumber', label: 'License Number', type: 'text', placeholder: 'DXB-00000' },
  { key: 'licenseExpiry', label: 'License Expiry', type: 'date' },
  { key: 'vehiclePlate', label: 'Assign Vehicle', type: 'select', options: [{ value: '', label: 'Unassigned' }, ...availableVehicles] },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'ONLINE', label: 'Online' },
    { value: 'OFFLINE', label: 'Offline' },
    { value: 'ON_TRIP', label: 'On Trip' },
    { value: 'BREAK', label: 'Break' },
  ]},
];

export default function DriversPage() {
  const { lang, setLang, isRtl } = useLang();
  const [drivers, setDrivers] = useState<MockDriver[]>(mockDrivers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MockDriver | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = drivers.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (data: Record<string, any>) => {
    if (editItem) {
      setDrivers(prev => prev.map(d => d.id === editItem.id ? { ...d, ...data } as MockDriver : d));
    } else {
      const newDriver: MockDriver = {
        id: Date.now().toString(),
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        licenseNumber: data.licenseNumber || '',
        licenseExpiry: data.licenseExpiry || '',
        status: data.status || 'OFFLINE',
        vehiclePlate: data.vehiclePlate || undefined,
        rating: 5.0,
        totalTrips: 0,
      };
      setDrivers(prev => [...prev, newDriver]);
    }
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      setDrivers(prev => prev.filter(d => d.id !== deleteId));
      setDeleteId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span className="text-xs font-bold text-amber-400">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <>
      <AdminTopbar lang={lang} setLang={setLang} title={titles[lang]} isRtl={isRtl} />

      <div className="p-10">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div className="flex gap-4 items-center flex-1">
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
              <option value="ONLINE" className="bg-[#0c0c1e]">Online</option>
              <option value="OFFLINE" className="bg-[#0c0c1e]">Offline</option>
              <option value="ON_TRIP" className="bg-[#0c0c1e]">On Trip</option>
              <option value="BREAK" className="bg-[#0c0c1e]">Break</option>
            </select>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            {lang === 'tr' ? 'Sürücü Ekle' : lang === 'ar' ? 'إضافة سائق' : 'Add Driver'}
          </button>
        </div>

        {/* Table */}
        <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0c0c1e] border-b border-white/[0.05]">
              <tr>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Sürücü' : lang === 'ar' ? 'السائق' : 'Driver'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Ehliyet' : lang === 'ar' ? 'الرخصة' : 'License'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Telefon' : lang === 'ar' ? 'الهاتف' : 'Phone'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Araç' : lang === 'ar' ? 'المركبة' : 'Vehicle'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Puan' : lang === 'ar' ? 'التقييم' : 'Rating'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Durum' : lang === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px] text-right">
                  {lang === 'tr' ? 'İşlemler' : lang === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center font-bold text-purple-400">
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white">{d.name}</span>
                        <p className="text-[10px] text-slate-500">{d.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-400 font-medium">{d.licenseNumber}</td>
                  <td className="px-8 py-5 text-sm text-slate-500 font-mono">{d.phone}</td>
                  <td className="px-8 py-5 text-sm text-slate-400">
                    {d.vehiclePlate ? (
                      <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black border border-blue-500/20">{d.vehiclePlate}</span>
                    ) : (
                      <span className="text-slate-600 italic text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div>
                      {renderStars(d.rating)}
                      <p className="text-[10px] text-slate-500 mt-0.5">{d.totalTrips} trips</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => { setEditItem(d); setShowModal(true); }}
                        className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-indigo-500/20 hover:text-indigo-400 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(d.id)}
                        className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-red-500/20 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center text-slate-500 text-sm">
                    {lang === 'tr' ? 'Sürücü bulunamadı.' : lang === 'ar' ? 'لم يتم العثور على سائقين.' : 'No drivers found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 px-4">
          <p className="text-[11px] text-slate-500 font-bold">
            {filtered.length} / {drivers.length} {lang === 'tr' ? 'sürücü' : lang === 'ar' ? 'سائق' : 'drivers'}
          </p>
        </div>
      </div>

      <EntityModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        onSave={handleSave}
        title={editItem
          ? (lang === 'tr' ? 'Sürücü Düzenle' : lang === 'ar' ? 'تعديل السائق' : 'Edit Driver')
          : (lang === 'tr' ? 'Yeni Sürücü Ekle' : lang === 'ar' ? 'إضافة سائق جديد' : 'Add New Driver')
        }
        fields={driverFields}
        initialData={editItem ? {
          name: editItem.name,
          email: editItem.email,
          phone: editItem.phone,
          licenseNumber: editItem.licenseNumber,
          licenseExpiry: editItem.licenseExpiry,
          vehiclePlate: editItem.vehiclePlate || '',
          status: editItem.status,
        } : undefined}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={lang === 'tr' ? 'Sürücüyü Sil' : lang === 'ar' ? 'حذف السائق' : 'Delete Driver'}
        message={lang === 'tr' ? 'Bu sürücüyü silmek istediğinizden emin misiniz?' : lang === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذا السائق؟' : 'Are you sure you want to delete this driver? This action cannot be undone.'}
      />
    </>
  );
}
