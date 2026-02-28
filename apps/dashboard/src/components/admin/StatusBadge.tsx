"use client";

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  ACTIVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  ONLINE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },

  INACTIVE: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  OFFLINE: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  CANCELLED: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  Suspended: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },

  MAINTENANCE: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  ON_TRIP: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  BREAK: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  REQUESTED: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
};

const defaultColor = { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const c = statusColors[status] || defaultColor;
  const sizeClass = size === 'sm' ? 'px-3 py-1 text-[10px]' : 'px-4 py-1.5 text-xs';

  return (
    <span className={`${sizeClass} rounded-full ${c.bg} ${c.text} font-black border ${c.border} inline-block`}>
      {status.replace('_', ' ')}
    </span>
  );
}
