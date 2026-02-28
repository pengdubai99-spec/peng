"use client";

import { Search, Bell } from "lucide-react";
import { Language } from "../../lib/i18n";

interface AdminTopbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  title: string;
  isRtl: boolean;
}

export default function AdminTopbar({ lang, setLang, title, isRtl }: AdminTopbarProps) {
  return (
    <header className="h-20 border-b border-white/[0.05] bg-white/[0.01] backdrop-blur-md flex items-center justify-between px-10">
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>

      <div className="flex items-center gap-6">
        {/* Language Switcher */}
        <div className="flex bg-white/[0.03] rounded-xl p-1 border border-white/5">
          {(['en', 'tr', 'ar'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                lang === l ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center cursor-pointer hover:bg-white/[0.1] transition-all">
            <Bell className="w-5 h-5 text-slate-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[8px] font-black text-white">3</span>
          </div>
        </div>
      </div>
    </header>
  );
}
