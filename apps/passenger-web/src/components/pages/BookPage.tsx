'use client';

import { useState, useEffect } from 'react';
import { useStore, apiGetNearbyDrivers, apiCreateTrip, FALLBACK_DRIVERS } from '@/lib/store';
import type { Driver } from '@/lib/store';
import { Glow, Card, Pill, Avatar } from '../Layout';

export default function BookPage() {
  const { destination, setDestination, setPage, setSelectedDriver, setActiveTrip, token } = useStore();
  const [selected, setSelected] = useState<Driver | null>(null);
  const [rideType, setRideType] = useState<'economy' | 'comfort' | 'premium'>('economy');
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>(FALLBACK_DRIVERS);

  useEffect(() => {
    apiGetNearbyDrivers().then(setDrivers);
  }, []);

  const rideTypes = [
    { id: 'economy', icon: '🚗', label: 'Ekonomik', mult: 1.0, desc: 'Uygun fiyat' },
    { id: 'comfort', icon: '🚙', label: 'Konfor', mult: 1.4, desc: 'Geniş araç' },
    { id: 'premium', icon: '✨', label: 'Premium', mult: 2.0, desc: 'Lüks sürüş' },
  ] as const;

  const getFare = (mult: number) => Math.round(45 * mult + 15);

  const handleBook = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const mult = rideTypes.find(r => r.id === rideType)?.mult || 1;
      const fare = Math.round(45 * mult + 15);
      const trip = await apiCreateTrip(token, selected.id, 'Mevcut Konum', destination, fare);
      setSelectedDriver(selected);
      setActiveTrip(trip);
      setPage('tracking');
    } catch {
      setSelectedDriver(selected);
      setActiveTrip({ id: `demo-${Date.now()}`, status: 'REQUESTED', driverId: selected.id, startAddress: 'Mevcut Konum', endAddress: destination, demo: true });
      setPage('tracking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 100 }}>
      <Glow color="#6366F1" top="-80px" left="-60px" />

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px', borderBottom: '1px solid #1A1A2E',
      }}>
        <button onClick={() => setPage('home')} style={{
          background: 'none', border: 'none', color: '#9CA3AF', fontSize: 14, cursor: 'pointer',
        }}>← Geri</button>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Sürücü Seç</span>
        <div style={{ width: 60 }} />
      </header>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600, margin: '0 auto' }}>
        {/* Hedef */}
        <Card style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>📍</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#6B7280', fontSize: 11, marginBottom: 3 }}>HEDEFİNİZ</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{destination}</div>
          </div>
          <button onClick={() => { setDestination(''); setPage('home'); }} style={{
            background: 'none', border: 'none', color: '#818CF8', fontSize: 13, cursor: 'pointer',
          }}>Değiştir</button>
        </Card>

        {/* Yolculuk tipi */}
        <div>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Yolculuk Tipi</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {rideTypes.map(rt => (
              <Card key={rt.id}
                onClick={() => setRideType(rt.id)}
                style={{
                  padding: 12, textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s',
                  ...(rideType === rt.id ? {
                    borderColor: '#6366F1',
                    background: 'rgba(99,102,241,0.1)',
                  } : {}),
                }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{rt.icon}</div>
                <div style={{ color: rideType === rt.id ? '#818CF8' : '#fff', fontWeight: 700, fontSize: 12 }}>{rt.label}</div>
                <div style={{ color: '#6B7280', fontSize: 10, marginTop: 3 }}>{rt.desc}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sürücüler */}
        <div>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Yakındaki Sürücüler</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {drivers.map((driver: Driver) => {
              const mult = rideTypes.find(r => r.id === rideType)?.mult || 1;
              const fare = getFare(mult);
              const isSelected = selected?.id === driver.id;

              return (
                <Card key={driver.id}
                  onClick={() => setSelected(driver)}
                  style={{
                    padding: 16, cursor: 'pointer', transition: 'all 0.2s',
                    ...(isSelected ? { borderColor: '#6366F1', background: 'rgba(99,102,241,0.08)' } : {}),
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar initials={driver.avatar} size={52} bg={isSelected ? '#6366F1' : '#1A1A2E'} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>{driver.name}</div>
                      <div style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>
                        {driver.model} · {driver.color} · {driver.plate}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <span style={{ color: '#F59E0B', fontSize: 12 }}>★ {driver.rating}</span>
                        <span style={{ color: '#374151' }}>·</span>
                        <span style={{ color: '#22C55E', fontSize: 12, fontWeight: 600 }}>{driver.eta}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>₺{fare}</div>
                      <div style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>tahmini</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{
                      marginTop: 12, paddingTop: 12,
                      borderTop: '1px solid rgba(99,102,241,0.2)',
                      display: 'flex', gap: 8,
                    }}>
                      <Pill label="✓ Seçildi" color="#22C55E" />
                      <Pill label={`ETA ${driver.eta}`} color="#6366F1" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alt buton */}
      {selected && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, padding: 20,
          background: 'rgba(5,5,16,0.95)', backdropFilter: 'blur(12px)',
          borderTop: '1px solid #1A1A2E',
        }}>
          <button className="btn-primary" onClick={handleBook} disabled={loading}
            style={{ width: '100%', fontSize: 15 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.6s linear infinite' }} />
                Sürücü aranıyor...
              </span>
            ) : `${selected.name} ile Yolculuğu Başlat →`}
          </button>
        </div>
      )}
    </div>
  );
}
