"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'indigo' | 'purple' | 'emerald' | 'amber' | 'pink' | 'blue';
  trend?: string;
}

const colorMap = {
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
};

export default function StatsCard({ label, value, icon: Icon, color, trend }: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div className="p-6 rounded-3xl border border-white/[0.03] bg-white/[0.02] backdrop-blur-sm flex items-center gap-4 group hover:border-white/[0.08] transition-all">
      <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center border ${c.border} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${c.text}`} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && <span className="text-[10px] font-bold text-emerald-400">{trend}</span>}
        </div>
      </div>
    </div>
  );
}
