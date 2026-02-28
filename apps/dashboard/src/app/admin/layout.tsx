"use client";

import { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Language } from "../../lib/i18n";
import { LangContext } from "../../lib/admin-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const isRtl = lang === 'ar';

  return (
    <LangContext.Provider value={{ lang, setLang, isRtl }}>
      <div className={`flex min-h-screen bg-[#050510] text-[#f0f0ff] font-['Outfit'] ${isRtl ? "font-['IBM_Plex_Sans_Arabic'] flex-row-reverse" : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <AdminSidebar lang={lang} />

        <main className="flex-1 flex flex-col relative z-10 min-w-0">
          {children}
        </main>
      </div>
    </LangContext.Provider>
  );
}
