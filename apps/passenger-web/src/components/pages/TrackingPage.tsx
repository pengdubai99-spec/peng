'use client';

import { useState, useEffect } from 'react';
import { useStore, apiCompleteTrip, apiRateTrip } from '@/lib/store';
import { Glow, Card, Avatar } from '../Layout';

type Status = 'waiting' | 'onway' | 'arrived' | 'inride' | 'completed';

export default function TrackingPage() {
  const { selectedDriver, destination, setPage, setSelectedDriver, activeTrip, token, setActiveTrip } = useStore();
  const [status, setStatus] = useState<Status>('waiting');
  const [elapsed, setElapsed] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showRate, setShowRate] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStatus('onway'), 3000),
      setTimeout(() => setStatus('arrived'), 12000),
      setTimeout(() => setStatus('inride'), 16000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (status !== 'inride') return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const statusInfo: Record<Status, { label: string; color: string; icon: string; bg: string }> = {
    waiting: { label: 'Sürücü Bekleniyor...', color: '#F59E0B', icon: '⏳', bg: 'rgba(245,158,11,0.1)' },
    onway: { label: 'Sürücü Yolda', color: '#818CF8', icon: '🚗', bg: 'rgba(129,140,248,0.1)' },
    arrived: { label: 'Sürücü Kapıda!', color: '#22C55E', icon: '✅', bg: 'rgba(34,197,94,0.1)' },
    inride: { label: 'Yolculuk Devam Ediyor', color: '#22C55E', icon: '🛣️', bg: 'rgba(34,197,94,0.1)' },
    completed: { label: 'Yolculuk Tamamlandı', color: '#6B7280', icon: '🏁', bg: 'rgba(107,114,128,0.1)' },
  };

  const info = statusInfo[status];

  const handleComplete = async () => {
    setStatus('completed');
    if (activeTrip && !activeTrip.demo) {
      await apiCompleteTrip(token, activeTrip.id).catch(() => {});
    }
    setTimeout(() => setShowRate(true), 500);
  };

  const handleRate = async () => {
    if (activeTrip && !activeTrip.demo && rating > 0) {
      await apiRateTrip(token, activeTrip.id, rating, comment || undefined).catch(() => {});
    }
    setShowRate(false);
    setSelectedDriver(null);
    setActiveTrip(null);
    setPage('home');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 40 }}>
      <Glow color={info.color} top="-100px" left="-80px" size={300} />

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px', borderBottom: '1px solid #1A1A2E',
      }}>
        <button onClick={() => setPage('home')} style={{
          background: 'none', border: 'none', color: '#9CA3AF', fontSize: 14, cursor: 'pointer',
        }}>← Ana Sayfa</button>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Aktif Yolculuk</span>
        <div style={{ width: 70 }} />
      </header>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600, margin: '0 auto' }}>
        {/* Durum kartı */}
        <Card style={{ padding: 28, textAlign: 'center', background: info.bg, borderColor: info.color + '33' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{info.icon}</div>
          <div style={{ color: info.color, fontWeight: 800, fontSize: 18 }}>{info.label}</div>
          {status === 'inride' && (
            <div style={{ color: '#9CA3AF', fontSize: 13, marginTop: 8 }}>Geçen süre: {fmt(elapsed)}</div>
          )}
          {status === 'onway' && (
            <div style={{ color: '#9CA3AF', fontSize: 13, marginTop: 8 }}>
              Tahmini varış: <strong style={{ color: info.color }}>{selectedDriver?.eta}</strong>
            </div>
          )}
          {/* Progress bar */}
          <div style={{
            marginTop: 20, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 2, background: info.color,
              width: status === 'waiting' ? '15%' : status === 'onway' ? '40%' : status === 'arrived' ? '65%' : status === 'inride' ? '85%' : '100%',
              transition: 'width 1s ease',
            }} />
          </div>
        </Card>

        {/* Sürücü bilgisi */}
        {selectedDriver && (
          <Card style={{ padding: 20 }}>
            <h3 style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: 0.5 }}>SÜRÜCÜ</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar initials={selectedDriver.avatar} size={60} bg="#6366F1" />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{selectedDriver.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <span style={{ color: '#F59E0B', fontSize: 13 }}>★ {selectedDriver.rating}</span>
                </div>
                <div style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>
                  {selectedDriver.model} · {selectedDriver.color}
                </div>
                <div style={{
                  marginTop: 8, display: 'inline-block',
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 8, padding: '4px 12px',
                  color: '#818CF8', fontWeight: 800, fontSize: 15, letterSpacing: 2,
                }}>{selectedDriver.plate}</div>
              </div>
              <a href="tel:+905550000000" style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, textDecoration: 'none', flexShrink: 0,
              }}>📞</a>
            </div>
          </Card>
        )}

        {/* Rota */}
        <Card style={{ padding: 20 }}>
          <h3 style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: 0.5 }}>ROTA</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E' }} />
              <div style={{ width: 2, height: 40, background: '#1A1A2E', margin: '4px 0' }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#6366F1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#6B7280', fontSize: 11 }}>ALIŞ NOKTASI</div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginTop: 2 }}>Mevcut Konum</div>
              </div>
              <div style={{ height: 1, background: '#1A1A2E', marginBottom: 12 }} />
              <div>
                <div style={{ color: '#6B7280', fontSize: 11 }}>HEDEFİNİZ</div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginTop: 2 }}>{destination}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Güvenlik */}
        <Card style={{ padding: 20 }}>
          <h3 style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: 0.5 }}>GÜVENLİK</h3>
          {[
            { icon: '🛡️', text: 'PENG AI güvenlik aktif' },
            { icon: '📹', text: 'Araç kamerası kayıt yapıyor' },
            { icon: '📍', text: 'Gerçek zamanlı GPS takip açık' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 2 ? 12 : 0 }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ color: '#9CA3AF', fontSize: 13, flex: 1 }}>{item.text}</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
            </div>
          ))}
        </Card>

        {/* SOS */}
        <button
          onClick={() => alert('🚨 Acil yardım bildirimi gönderildi!')}
          style={{
            background: 'rgba(26,0,0,0.8)', border: '1.5px solid rgba(239,68,68,0.4)',
            borderRadius: 16, padding: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
          <span style={{ fontSize: 22 }}>🆘</span>
          <span style={{ color: '#EF4444', fontWeight: 800, fontSize: 15 }}>ACİL YARDIM (SOS)</span>
        </button>

        {/* Tamamla */}
        {status === 'inride' && (
          <button className="btn-primary" onClick={handleComplete}
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', fontSize: 15 }}>
            Yolculuğu Tamamla ✓
          </button>
        )}
      </div>

      {/* Değerlendirme modal */}
      {showRate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: '#0D0D1A', borderRadius: '24px 24px 0 0',
            border: '1px solid #1A1A2E', padding: 32,
            width: '100%', maxWidth: 480,
          }}>
            <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>
              Yolculuk Tamamlandı! 🎉
            </h2>
            <p style={{ color: '#6B7280', textAlign: 'center', fontSize: 14, marginBottom: 28 }}>
              {selectedDriver?.name} ile yolculuğunuzu değerlendirin
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 40, color: star <= rating ? '#F59E0B' : '#1A1A2E',
                  transition: 'color 0.15s',
                }}>★</button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Yorum ekleyin (isteğe bağlı)"
              style={{
                width: '100%', background: '#0D0D1A', border: '1px solid #1A1A2E',
                borderRadius: 10, color: '#fff', fontSize: 13, padding: '10px 14px',
                resize: 'none', height: 70, marginBottom: 16, boxSizing: 'border-box',
              }}
            />
            <button className="btn-primary" onClick={handleRate} style={{ width: '100%', fontSize: 15 }}>
              Değerlendirmeyi Gönder →
            </button>
            <button onClick={() => { setShowRate(false); setPage('home'); }} style={{
              width: '100%', marginTop: 12, background: 'none', border: 'none',
              color: '#6B7280', fontSize: 14, cursor: 'pointer', padding: 8,
            }}>Atla</button>
          </div>
        </div>
      )}
    </div>
  );
}
