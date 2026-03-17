'use client';

import { useStore } from '@/lib/store';
import { Glow, Card, Avatar, Pill, NavBar } from '../Layout';

export default function ProfilePage() {
  const { user, setPage, logout } = useStore();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  const menuItems = [
    { icon: '👤', label: 'Hesap Bilgileri' },
    { icon: '💳', label: 'Ödeme Yöntemleri' },
    { icon: '🔔', label: 'Bildirimler' },
    { icon: '🛡️', label: 'Gizlilik & Güvenlik' },
    { icon: '🌍', label: 'Dil Ayarları' },
    { icon: '❓', label: 'Yardım & Destek' },
    { icon: '⭐', label: 'Uygulamayı Değerlendir' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 90 }}>
      <Glow color="#EC4899" top="-60px" right="-60px" size={250} />

      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', borderBottom: '1px solid #1A1A2E',
      }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Profilim</span>
      </header>

      <div style={{ padding: '20px', maxWidth: 600, margin: '0 auto' }}>
        {/* Profil kartı */}
        <Card style={{ padding: 28, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <Avatar initials={initials} size={88} bg="#6366F1" />
          </div>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>
            {user?.name || 'Demo Kullanıcı'}
          </h2>
          <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>
            {user?.email || 'demo@peng.ae'}
          </p>
          {user?.phone && (
            <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>{user.phone}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
            <Pill label="✓ Doğrulandı" color="#22C55E" />
            <Pill label="PENG Üye" color="#6366F1" />
          </div>
        </Card>

        {/* İstatistikler */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Yolculuk', value: '5', color: '#818CF8' },
            { label: 'Puan', value: '4.8★', color: '#F59E0B' },
            { label: 'Bu Ay', value: '₺438', color: '#22C55E' },
          ].map((s, i) => (
            <Card key={i} style={{ padding: 14, textAlign: 'center' }}>
              <div style={{ color: s.color, fontSize: 20, fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: '#6B7280', fontSize: 11, marginTop: 4 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Menü */}
        <Card style={{ marginBottom: 16 }}>
          {menuItems.map((item, i) => (
            <button key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px', width: '100%',
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              borderBottom: i < menuItems.length - 1 ? '1px solid #1A1A2E' : 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ flex: 1, color: '#fff', fontSize: 14, fontWeight: 500 }}>{item.label}</span>
              <span style={{ color: '#374151', fontSize: 18 }}>›</span>
            </button>
          ))}
        </Card>

        {/* Çıkış */}
        {user ? (
          <button onClick={() => {
            if (confirm('Hesabınızdan çıkmak istediğinizden emin misiniz?')) logout();
          }} style={{
            width: '100%', background: 'rgba(26,0,0,0.5)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 16, padding: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 18 }}>🚪</span>
            <span style={{ color: '#EF4444', fontWeight: 700, fontSize: 15 }}>Çıkış Yap</span>
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setPage('login')}
            style={{ width: '100%', fontSize: 15 }}>
            Giriş Yap →
          </button>
        )}

        <p style={{ textAlign: 'center', color: '#374151', fontSize: 11, marginTop: 24 }}>
          PENG Passenger Web v1.0.0 · © 2026 PENG
        </p>
      </div>

      <NavBar />
    </div>
  );
}
