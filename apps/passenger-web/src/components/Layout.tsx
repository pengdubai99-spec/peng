'use client';

import { useStore } from '@/lib/store';

export function Glow({ color = '#6366F1', top, bottom, left, right, size = 400 }: {
  color?: string; top?: string; bottom?: string; left?: string; right?: string; size?: number;
}) {
  return (
    <div style={{
      position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      width: size, height: size,
      background: color,
      filter: 'blur(100px)',
      opacity: 0.06,
      top, bottom, left, right,
    }} />
  );
}

export function PengLogo({ size = 40 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 20px rgba(99,102,241,0.4)',
    }}>
      <span style={{ color: '#fff', fontSize: size * 0.42, fontWeight: 900 }}>P</span>
    </div>
  );
}

export function Avatar({ initials, size = 44, bg = '#6366F1' }: { initials: string; size?: number; bg?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: size * 0.38 }}>{initials}</span>
    </div>
  );
}

export function NavBar() {
  const { page, setPage, user } = useStore();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  const navItems = [
    { id: 'home', icon: '🏠', label: 'Ana Sayfa' },
    { id: 'history', icon: '🕐', label: 'Geçmiş' },
    { id: 'profile', icon: '👤', label: 'Profil' },
  ] as const;

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid #1A1A2E',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '12px 0 max(12px, env(safe-area-inset-bottom))',
    }}>
      {navItems.map(item => (
        <button key={item.id} onClick={() => setPage(item.id)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 20px',
          }}>
          <span style={{ fontSize: 22 }}>{item.icon}</span>
          <span style={{
            fontSize: 11, fontWeight: page === item.id ? 700 : 400,
            color: page === item.id ? '#818CF8' : '#6B7280',
          }}>{item.label}</span>
          {page === item.id && (
            <div style={{ width: 4, height: 4, borderRadius: 2, background: '#6366F1', marginTop: 1 }} />
          )}
        </button>
      ))}
    </nav>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#0D0D1A', borderRadius: 18,
      border: '1px solid #1A1A2E',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Pill({ label, color = '#6366F1' }: { label: string; color?: string }) {
  return (
    <span style={{
      background: color + '22', color, borderRadius: 20,
      padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
    }}>{label}</span>
  );
}
