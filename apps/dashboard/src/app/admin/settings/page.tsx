"use client";

import { useState } from "react";
import { Save, Globe, Shield, Database, Bell, Server } from "lucide-react";
import { useLang } from "../../../lib/admin-context";
import AdminTopbar from "../../../components/admin/AdminTopbar";

const titles = { en: 'Settings', tr: 'Ayarlar', ar: 'الإعدادات' };

interface SettingsSection {
  id: string;
  icon: any;
  title: Record<string, string>;
  fields: { key: string; label: string; type: string; value: string; placeholder?: string }[];
}

const sections: SettingsSection[] = [
  {
    id: 'platform',
    icon: Globe,
    title: { en: 'Platform', tr: 'Platform', ar: 'المنصة' },
    fields: [
      { key: 'platformName', label: 'Platform Name', type: 'text', value: 'PENG SafeRide', placeholder: 'Platform Name' },
      { key: 'defaultLang', label: 'Default Language', type: 'text', value: 'en', placeholder: 'en / tr / ar' },
      { key: 'timezone', label: 'Timezone', type: 'text', value: 'Asia/Dubai (GMT+4)', placeholder: 'Timezone' },
    ],
  },
  {
    id: 'api',
    icon: Server,
    title: { en: 'API Configuration', tr: 'API Yapılandırması', ar: 'إعدادات API' },
    fields: [
      { key: 'authUrl', label: 'Auth Service URL', type: 'text', value: 'http://localhost:3001', placeholder: 'Auth service URL' },
      { key: 'trackingUrl', label: 'Tracking Service URL', type: 'text', value: 'http://localhost:3005', placeholder: 'Tracking service URL' },
      { key: 'mapsKey', label: 'Google Maps API Key', type: 'text', value: '***********', placeholder: 'API Key' },
    ],
  },
  {
    id: 'security',
    icon: Shield,
    title: { en: 'Security', tr: 'Güvenlik', ar: 'الأمان' },
    fields: [
      { key: 'jwtExpiry', label: 'JWT Token Expiry', type: 'text', value: '15m', placeholder: '15m / 1h / 1d' },
      { key: 'refreshExpiry', label: 'Refresh Token Expiry', type: 'text', value: '7d', placeholder: '7d / 30d' },
      { key: 'maxLoginAttempts', label: 'Max Login Attempts', type: 'number', value: '5', placeholder: '5' },
    ],
  },
  {
    id: 'notifications',
    icon: Bell,
    title: { en: 'Notifications', tr: 'Bildirimler', ar: 'الإشعارات' },
    fields: [
      { key: 'emailAlerts', label: 'Email Alerts', type: 'text', value: 'Enabled', placeholder: 'Enabled / Disabled' },
      { key: 'speedThreshold', label: 'Speed Alert Threshold (km/h)', type: 'number', value: '120', placeholder: '120' },
      { key: 'geofenceAlerts', label: 'Geofence Alerts', type: 'text', value: 'Enabled', placeholder: 'Enabled / Disabled' },
    ],
  },
  {
    id: 'storage',
    icon: Database,
    title: { en: 'Data & Storage', tr: 'Veri & Depolama', ar: 'البيانات والتخزين' },
    fields: [
      { key: 'dbUrl', label: 'Database', type: 'text', value: 'PostgreSQL 16 (localhost:5432)', placeholder: 'Database URL' },
      { key: 'redisUrl', label: 'Redis', type: 'text', value: 'Redis 7 (localhost:6379)', placeholder: 'Redis URL' },
      { key: 'videoRetention', label: 'Video Retention (days)', type: 'number', value: '30', placeholder: '30' },
    ],
  },
];

export default function SettingsPage() {
  const { lang, setLang, isRtl } = useLang();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    sections.forEach(s => s.fields.forEach(f => { initial[f.key] = f.value; }));
    return initial;
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <AdminTopbar lang={lang} setLang={setLang} title={titles[lang]} isRtl={isRtl} />

      <div className="p-10 max-w-4xl">
        <div className="space-y-8">
          {sections.map(section => (
            <div key={section.id} className="rounded-[32px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-white/[0.05] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  {section.title[lang] || section.title.en}
                </h3>
              </div>
              <div className="p-8 space-y-5">
                {section.fields.map(field => (
                  <div key={field.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest w-56 shrink-0">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={settings[field.key] || ''}
                      onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className={`px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
              saved
                ? 'bg-emerald-600 shadow-emerald-600/20 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 text-white'
            }`}
          >
            <Save className="w-5 h-5" />
            {saved
              ? (lang === 'tr' ? 'Kaydedildi!' : lang === 'ar' ? 'تم الحفظ!' : 'Saved!')
              : (lang === 'tr' ? 'Kaydet' : lang === 'ar' ? 'حفظ' : 'Save Settings')
            }
          </button>
        </div>
      </div>
    </>
  );
}
