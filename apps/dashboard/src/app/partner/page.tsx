"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Key, 
  ChevronRight, 
  ShieldCheck, 
  Globe,
  Lock
} from "lucide-react";
import { translations, Language } from "../../lib/i18n";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('en');
  const [accessKey, setAccessKey] = useState("");
  const [loading, setLoading] = useState(false);
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey) return;
    
    setLoading(true);
    // Simulate validation
    setTimeout(() => {
      // For demo purposes, any key works, but we'll use Skyline's as default
      const partnerName = accessKey.includes("SK") ? "Skyline Logistics" : "Desert Fleet Co";
      router.push(`/partner/dashboard?key=${accessKey}&partner=${encodeURIComponent(partnerName)}&lang=${lang}`);
    }, 1500);
  };

  return (
    <div className={`min-h-screen bg-[#050510] text-white flex flex-col font-['Outfit'] ${isRtl ? 'font-["IBM_Plex_Sans_Arabic"]' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Mesh Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Language Switcher */}
      <div className="absolute top-8 right-8 z-50 flex bg-white/[0.03] rounded-xl p-1 border border-white/5 backdrop-blur-md">
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

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl shadow-2xl"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6 group cursor-pointer">
              <ShieldCheck className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter gradient-text-peng mb-2">PENG</h1>
            <p className="text-slate-400 text-sm font-medium text-center">{t.partnerPortal}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                {t.accessKey}
              </label>
              <div className="relative">
                <Key className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400/50`} />
                <input 
                  type="text" 
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                  placeholder="PENG-XX-0000"
                  className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 ${isRtl ? 'pr-12 pl-6' : 'pl-12 pr-6'} text-white font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700 tracking-wider`}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed px-1">
              {t.partnerLoginDesc}
            </p>

            <button 
              disabled={loading || !accessKey}
              className="w-full h-16 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t.loginToPortal}</span>
                  <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
               <Lock className="w-3 h-3" />
               <span>{t.secureCloudAccess}</span>
             </div>
             <div className="h-px w-20 bg-white/[0.05]" />
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Globe className="w-3 h-3" />
                  <span className="text-[10px] font-bold">DXB CENTRAL</span>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <footer className="p-8 text-center">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[4px]">PENG DIGITAL TWIN ECOSYSTEM</p>
      </footer>

      <style jsx global>{`
        .gradient-text-peng {
          background: linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}
