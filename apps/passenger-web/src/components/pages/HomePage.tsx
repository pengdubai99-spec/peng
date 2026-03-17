'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Glow, PengLogo, NavBar, Card } from '../Layout';

export default function HomePage() {
  const { setPage, setDestination, user } = useStore();
  const [dest, setDest] = useState('');

  const quickDests = [
    { icon: '✈️', label: 'Havalimanı', address: 'İstanbul Havalimanı' },
    { icon: '🏢', label: 'Levent İş', address: 'Levent, İstanbul' },
    { icon: '🏠', label: 'Kadıköy', address: 'Kadıköy Meydanı' },
    { icon: '🛍️', label: 'İstinye Park', address: 'İstinye Park AVM' },
  ];

  const handleSearch = () => {
    if (!dest.trim()) return;
    setDestination(dest.trim());
    setPage('book');
  };

  const handleQuick = (address: string) => {
    setDestination(address);
    setPage('book');
  };

  const firstName = user?.name?.split(' ')[0] || 'Misafir';

  return (
    <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 80 }}>
      <Glow color="#6366F1" top="-150px" left="-100px" />
      <Glow color="#EC4899" bottom="0px" right="-100px" />

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 20px 16px',
        borderBottom: '1px solid #1A1A2E',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PengLogo size={36} />
          <div>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Merhaba 👋</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{firstName}</div>
          </div>
        </div>
        <button
          onClick={() => setPage(user ? 'profile' : 'login')}
          style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1, #EC4899)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14,
          }}>
          {user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '👤'}
        </button>
      </header>

      <main style={{ padding: '24px 20px', position: 'relative', zIndex: 10 }}>
        {/* Hero harita alanı */}
        <div style={{
          borderRadius: 20, overflow: 'hidden', marginBottom: 20,
          border: '1px solid #1A1A2E', position: 'relative', height: 220,
          background: '#080818',
        }}>
          {/* Grid */}
          {[...Array(6)].map((_, i) => (
            <div key={`h${i}`} style={{
              position: 'absolute', left: 0, right: 0,
              top: `${(i + 1) * (220 / 7)}px`,
              height: 1, background: 'rgba(99,102,241,0.08)',
            }} />
          ))}
          {[...Array(8)].map((_, i) => (
            <div key={`v${i}`} style={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${(i + 1) * (100 / 9)}%`,
              width: 1, background: 'rgba(99,102,241,0.08)',
            }} />
          ))}
          {/* Merkez glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 160, height: 160, borderRadius: '50%',
            background: 'rgba(99,102,241,0.08)',
          }} />
          {/* Pin */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -60%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 0 30px rgba(99,102,241,0.5)',
              animation: 'float 3s ease-in-out infinite',
            }}>📍</div>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: 'rgba(99,102,241,0.3)', marginTop: 4,
            }} />
          </div>
          {/* Konum badge */}
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            background: 'rgba(13,13,26,0.9)', borderRadius: 8,
            padding: '5px 10px', border: '1px solid #1A1A2E',
            fontSize: 11, color: '#22C55E', fontWeight: 700,
          }}>● Mevcut Konum</div>
          {/* Sürücü sayısı */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(13,13,26,0.9)', borderRadius: 8,
            padding: '5px 10px', border: '1px solid #1A1A2E',
            fontSize: 11, color: '#818CF8', fontWeight: 700,
          }}>🚗 3 Sürücü Yakında</div>
        </div>

        {/* Arama */}
        <Card style={{ padding: 4, display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ padding: '0 12px', fontSize: 20 }}>🔍</span>
          <input
            value={dest}
            onChange={e => setDest(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Nereye gitmek istiyorsunuz?"
            style={{
              flex: 1, background: 'none', border: 'none', padding: '14px 0',
              color: '#fff', fontSize: 15, outline: 'none',
            }}
          />
          {dest && (
            <button onClick={handleSearch} className="btn-primary"
              style={{ margin: 4, padding: '10px 20px', borderRadius: 12, fontSize: 14 }}>
              Git →
            </button>
          )}
        </Card>

        {/* Hızlı hedefler */}
        <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
          Sık Gidilen Yerler
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
          {quickDests.map((d, i) => (
            <Card key={i} style={{
              padding: 14, cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 10, transition: 'border-color 0.2s',
            }}
              onClick={() => handleQuick(d.address)}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1A1A2E')}
            >
              <span style={{ fontSize: 24 }}>{d.icon}</span>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{d.label}</div>
                <div style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>{d.address}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Özellikler */}
        <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
          Neden PENG?
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '🛡️', title: 'AI Güvenlik', desc: 'Yapay zeka ile sürekli izleme ve anlık uyarılar' },
            { icon: '📍', title: 'Canlı Takip', desc: 'Yolculuğunuzu gerçek zamanlı haritada görün' },
            { icon: '⭐', title: 'Kaliteli Sürücüler', desc: 'Puanlanmış ve doğrulanmış profesyonel sürücüler' },
          ].map((f, i) => (
            <Card key={i} style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>{f.icon}</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{f.title}</div>
                <div style={{ color: '#6B7280', fontSize: 12, marginTop: 3 }}>{f.desc}</div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <NavBar />
    </div>
  );
}
