"use client";

import { useState } from "react";
import { UserPlus, Plus, Edit, Trash2, Search, Key, Copy } from "lucide-react";
import { useLang } from "../../../lib/admin-context";
import AdminTopbar from "../../../components/admin/AdminTopbar";
import StatusBadge from "../../../components/admin/StatusBadge";
import EntityModal, { FieldConfig } from "../../../components/admin/EntityModal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import { mockFleets, MockFleet } from "../../../lib/mock-data";

const titles = { en: 'Fleet Partners', tr: 'Filo Ortakları', ar: 'شركاء الأسطول' };

const fleetFields: FieldConfig[] = [
  { key: 'name', label: 'Partner Name', type: 'text', placeholder: 'Company Name' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'contact@company.ae' },
  { key: 'plan', label: 'Plan', type: 'select', options: [
    { value: 'BASIC', label: 'Basic' },
    { value: 'PRO', label: 'Pro' },
    { value: 'ENTERPRISE', label: 'Enterprise' },
  ]},
  { key: 'tracking', label: 'GPS Tracking Access', type: 'checkbox' },
  { key: 'camera', label: 'Live Camera Access', type: 'checkbox' },
];

const planColors: Record<string, string> = {
  BASIC: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  PRO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ENTERPRISE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function FleetsPage() {
  const { lang, setLang, isRtl } = useLang();
  const [fleets, setFleets] = useState<MockFleet[]>(mockFleets);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MockFleet | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filtered = fleets.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  );

  const generateAccessKey = () => {
    return `PENG-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${new Date().getFullYear()}`;
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = (data: Record<string, any>) => {
    if (editItem) {
      setFleets(prev => prev.map(f => f.id === editItem.id ? { ...f, ...data } as MockFleet : f));
    } else {
      const newFleet: MockFleet = {
        id: Date.now().toString(),
        name: data.name || '',
        email: data.email || '',
        vehicleCount: 0,
        plan: data.plan || 'BASIC',
        accessKey: generateAccessKey(),
        tracking: data.tracking || false,
        camera: data.camera || false,
        status: 'Pending',
        trustScore: 100,
        revenue: 'AED 0',
      };
      setFleets(prev => [...prev, newFleet]);
    }
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      setFleets(prev => prev.filter(f => f.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <>
      <AdminTopbar lang={lang} setLang={setLang} title={titles[lang]} isRtl={isRtl} />

      <div className="p-10">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
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
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            {lang === 'tr' ? 'Ortak Ekle' : lang === 'ar' ? 'إضافة شريك' : 'Add Partner'}
          </button>
        </div>

        {/* Table */}
        <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500" />
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0c0c1e] border-b border-white/[0.05]">
              <tr>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Ortak' : lang === 'ar' ? 'الشريك' : 'Partner'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Plan' : lang === 'ar' ? 'الخطة' : 'Plan'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Erişim Anahtarı' : lang === 'ar' ? 'مفتاح الوصول' : 'Access Key'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Yetkiler' : lang === 'ar' ? 'الصلاحيات' : 'Permissions'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px]">
                  {lang === 'tr' ? 'Güven Skoru' : lang === 'ar' ? 'نقاط الثقة' : 'Trust Score'}
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[3px] text-right">
                  {lang === 'tr' ? 'İşlemler' : lang === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map(f => (
                <tr key={f.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold relative ${
                        f.status === 'Active' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {f.name.charAt(0)}
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0c0c1e] ${
                          f.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{f.name}</p>
                        <p className="text-[10px] text-slate-500">{f.email} · {f.vehicleCount} vehicles</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${planColors[f.plan]}`}>
                      {f.plan}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] font-black text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10">{f.accessKey}</code>
                      <button
                        onClick={() => copyKey(f.accessKey)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-all"
                        title="Copy"
                      >
                        <Copy className={`w-3.5 h-3.5 ${copiedKey === f.accessKey ? 'text-emerald-400' : 'text-slate-500'}`} />
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-2">
                      {f.tracking && <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[9px] font-black border border-blue-500/20">GPS</span>}
                      {f.camera && <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 text-[9px] font-black border border-pink-500/20">CAM</span>}
                      {!f.tracking && !f.camera && <span className="text-[10px] text-slate-600 italic">None</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{f.trustScore}%</span>
                        <span className="text-[10px] font-bold text-emerald-400">{f.revenue}</span>
                      </div>
                      <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${f.trustScore}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => { setEditItem(f); setShowModal(true); }}
                        className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-indigo-500/20 hover:text-indigo-400 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(f.id)}
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
                    {lang === 'tr' ? 'Filo ortağı bulunamadı.' : lang === 'ar' ? 'لم يتم العثور على شركاء.' : 'No fleet partners found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 px-4">
          <p className="text-[11px] text-slate-500 font-bold">
            {filtered.length} / {fleets.length} {lang === 'tr' ? 'ortak' : lang === 'ar' ? 'شريك' : 'partners'}
          </p>
        </div>
      </div>

      <EntityModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        onSave={handleSave}
        title={editItem
          ? (lang === 'tr' ? 'Ortağı Düzenle' : lang === 'ar' ? 'تعديل الشريك' : 'Edit Partner')
          : (lang === 'tr' ? 'Yeni Ortak Ekle' : lang === 'ar' ? 'إضافة شريك جديد' : 'Add New Partner')
        }
        fields={fleetFields}
        initialData={editItem ? {
          name: editItem.name,
          email: editItem.email,
          plan: editItem.plan,
          tracking: editItem.tracking,
          camera: editItem.camera,
        } : undefined}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={lang === 'tr' ? 'Ortağı Sil' : lang === 'ar' ? 'حذف الشريك' : 'Delete Partner'}
        message={lang === 'tr' ? 'Bu ortağı silmek istediğinizden emin misiniz?' : lang === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذا الشريك؟' : 'Are you sure you want to delete this partner? This action cannot be undone.'}
      />
    </>
  );
}
