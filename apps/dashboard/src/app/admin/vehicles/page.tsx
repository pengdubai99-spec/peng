"use client";

import { useState } from "react";
import { Car, Plus, Edit, Trash2, Search, Navigation, Eye } from "lucide-react";
import { useLang } from "../../../lib/admin-context";
import AdminTopbar from "../../../components/admin/AdminTopbar";
import StatusBadge from "../../../components/admin/StatusBadge";
import EntityModal, { FieldConfig } from "../../../components/admin/EntityModal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import { mockVehicles, MockVehicle, mockFleets } from "../../../lib/mock-data";

const titles = { en: 'Vehicle Management', tr: 'Araç Yönetimi', ar: 'إدارة المركبات' };

const vehicleFields: FieldConfig[] = [
  { key: 'plateNumber', label: 'Plate Number', type: 'text', placeholder: 'DXB 0000' },
  { key: 'brand', label: 'Brand', type: 'text', placeholder: 'BYD' },
  { key: 'model', label: 'Model', type: 'text', placeholder: 'Atto 3' },
  { key: 'year', label: 'Year', type: 'number', placeholder: '2025' },
  { key: 'deviceSerial', label: 'Device Serial', type: 'text', placeholder: 'PENG-XXX-000' },
  { key: 'fleetName', label: 'Fleet', type: 'select', options: mockFleets.map(f => ({ value: f.name, label: f.name })) },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
  ]},
];

export default function VehiclesPage() {
  const { lang, setLang, isRtl } = useLang();
  const [vehicles, setVehicles] = useState<MockVehicle[]>(mockVehicles);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MockVehicle | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = vehicles.filter(v => {
    const matchSearch = v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (data: Record<string, any>) => {
    if (editItem) {
      setVehicles(prev => prev.map(v => v.id === editItem.id ? { ...v, ...data } as MockVehicle : v));
    } else {
      const newVehicle: MockVehicle = {
        id: Date.now().toString(),
        plateNumber: data.plateNumber || '',
        brand: data.brand || '',
        model: data.model || '',
        year: data.year || 2025,
        status: data.status || 'ACTIVE',
        fleetId: '',
        fleetName: data.fleetName || 'Independent',
        deviceSerial: data.deviceSerial || '',
      };
      setVehicles(prev => [...prev, newVehicle]);
    }
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      setVehicles(prev => prev.filter(v => v.id !== deleteId));
      setDeleteId(null);
    }
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
              <option value="ACTIVE" className="bg-[#0c0c1e]">Active</option>
              <option value="INACTIVE" className="bg-[#0c0c1e]">Inactive</option>
              <option value="MAINTENANCE" className="bg-[#0c0c1e]">Maintenance</option>
            </select>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            {lang === 'tr' ? 'Araç Ekle' : lang === 'ar' ? 'إضافة مركبة' : 'Add Vehicle'}
          </button>
        </div>

        {/* Table */}
        <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0c0c1e] border-b border-white/[0.05]">
              <tr>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Plaka' : lang === 'ar' ? 'رقم اللوحة' : 'Plate'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Model' : lang === 'ar' ? 'الطراز' : 'Model'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Filo' : lang === 'ar' ? 'الأسطول' : 'Fleet'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Sürücü' : lang === 'ar' ? 'السائق' : 'Driver'}
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
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <Navigation className="w-5 h-5 text-indigo-400 rotate-45" />
                      </div>
                      <span className="text-sm font-bold text-white tracking-wide">{v.plateNumber}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm text-slate-300 font-medium">{v.brand} {v.model}</p>
                    <p className="text-[10px] text-slate-500">{v.year} · {v.deviceSerial}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black border border-indigo-500/20">{v.fleetName}</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-400 font-medium">
                    {v.driverName || <span className="text-slate-600 italic">Unassigned</span>}
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => { setEditItem(v); setShowModal(true); }}
                        className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-indigo-500/20 hover:text-indigo-400 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(v.id)}
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
                  <td colSpan={6} className="px-8 py-16 text-center text-slate-500 text-sm">
                    {lang === 'tr' ? 'Araç bulunamadı.' : lang === 'ar' ? 'لم يتم العثور على مركبات.' : 'No vehicles found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="mt-4 flex justify-between items-center px-4">
          <p className="text-[11px] text-slate-500 font-bold">
            {filtered.length} / {vehicles.length} {lang === 'tr' ? 'araç' : lang === 'ar' ? 'مركبة' : 'vehicles'}
          </p>
        </div>
      </div>

      <EntityModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        onSave={handleSave}
        title={editItem
          ? (lang === 'tr' ? 'Araç Düzenle' : lang === 'ar' ? 'تعديل المركبة' : 'Edit Vehicle')
          : (lang === 'tr' ? 'Yeni Araç Ekle' : lang === 'ar' ? 'إضافة مركبة جديدة' : 'Add New Vehicle')
        }
        fields={vehicleFields}
        initialData={editItem ? {
          plateNumber: editItem.plateNumber,
          brand: editItem.brand,
          model: editItem.model,
          year: editItem.year,
          deviceSerial: editItem.deviceSerial,
          fleetName: editItem.fleetName,
          status: editItem.status,
        } : undefined}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={lang === 'tr' ? 'Aracı Sil' : lang === 'ar' ? 'حذف المركبة' : 'Delete Vehicle'}
        message={lang === 'tr' ? 'Bu aracı silmek istediğinizden emin misiniz?' : lang === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذه المركبة؟' : 'Are you sure you want to delete this vehicle? This action cannot be undone.'}
      />
    </>
  );
}
