"use client";

import dynamic from "next/dynamic";
import { useLang } from "../../../lib/admin-context";
import AdminTopbar from "../../../components/admin/AdminTopbar";

const LiveTracking = dynamic(() => import("../../../components/LiveTracking"), { ssr: false });

const titles = { en: 'Live Monitoring', tr: 'Canlı İzleme', ar: 'المراقبة الحية' };

export default function MonitoringPage() {
  const { lang, setLang, isRtl } = useLang();

  return (
    <>
      <AdminTopbar lang={lang} setLang={setLang} title={titles[lang]} isRtl={isRtl} />

      <div className="flex-1 p-6">
        <div className="h-[calc(100vh-10rem)] rounded-[32px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          <LiveTracking lang={lang} />
        </div>
      </div>
    </>
  );
}
