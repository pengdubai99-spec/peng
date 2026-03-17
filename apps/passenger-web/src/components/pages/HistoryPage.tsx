'use client';

import { useStore } from '@/lib/store';
import { Glow, Card, Pill, NavBar } from '../Layout';

const mockHistory = [
  { id: '1', date: '17 Mar 2026, 14:30', driver: 'Ahmed Mansoor', from: 'Kadıköy', to: 'Levent', status: 'COMPLETED', fare: 78, duration: '42 dk', rating: 5 },
  { id: '2', date: '15 Mar 2026, 09:15', driver: 'Omar Hassan', from: 'Beşiktaş', to: 'Maslak', status: 'COMPLETED', fare: 95, duration: '38 dk', rating: 4 },
  { id: '3', date: '12 Mar 2026, 20:00', driver: 'Khalid Al-Rashid', from: 'Şişli', to: 'Ataşehir', status: 'COMPLETED', fare: 120, duration: '55 dk', rating: 5 },
  { id: '4', date: '8 Mar 2026, 11:45', driver: 'Ahmed Mansoor', from: 'Üsküdar', to: 'Taksim', status: 'CANCELLED', fare: 0, duration: '-' },
  { id: '5', date: '5 Mar 2026, 17:20', driver: 'Omar Hassan', from: 'Sarıyer', to: 'Bağcılar', status: 'COMPLETED', fare: 145, duration: '68 dk', rating: 4 },
];

const statusColors: Record<string, string> = { COMPLETED: '#22C55E', CANCELLED: '#EF4444', PENDING: '#F59E0B', ACTIVE: '#818CF8' };
const statusLabels: Record<string, string> = { COMPLETED: 'Tamamlandı', CANCELLED: 'İptal', PENDING: 'Bekliyor', ACTIVE: 'Devam Ediyor' };

export default function HistoryPage() {
  const { setPage } = useStore();
  const totalSpent = mockHistory.filter(t => t.status === 'COMPLETED').reduce((a, t) => a + t.fare, 0);
  const completedCount = mockHistory.filter(t => t.status === 'COMPLETED').length;

  return (
    <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 90 }}>
      <Glow color="#6366F1" top="-60px" right="-60px" size={250} />

      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px', borderBottom: '1px solid #1A1A2E',
      }}>
        <div style={{ width: 60 }} />
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Geçmiş</span>
        <div style={{ width: 60 }} />
      </header>

      <div style={{ padding: '20px', maxWidth: 600, margin: '0 auto' }}>
        {/* Özet */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Yolculuk', value: completedCount.toString(), color: '#818CF8' },
            { label: 'Harcama', value: `₺${totalSpent}`, color: '#22C55E' },
            { label: 'Ort. Puan', value: '4.8★', color: '#F59E0B' },
          ].map((s, i) => (
            <Card key={i} style={{ padding: 14, textAlign: 'center' }}>
              <div style={{ color: s.color, fontSize: 20, fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: '#6B7280', fontSize: 11, marginTop: 4 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Liste */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mockHistory.map(trip => (
            <Card key={trip.id} style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#6B7280', fontSize: 12 }}>{trip.date}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {trip.rating && <Pill label={`★ ${trip.rating}`} color="#F59E0B" />}
                  <Pill label={statusLabels[trip.status]} color={statusColors[trip.status]} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
                  <div style={{ width: 1, height: 30, background: '#1A1A2E', margin: '2px 0' }} />
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: '#6366F1' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{trip.from}</div>
                  <div style={{ height: 1, background: '#1A1A2E', margin: '6px 0' }} />
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{trip.to}</div>
                </div>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: 12, paddingTop: 10, borderTop: '1px solid #1A1A2E',
              }}>
                <span style={{ color: '#6B7280', fontSize: 12 }}>🧑‍💼 {trip.driver}</span>
                <span style={{ color: '#6B7280', fontSize: 12 }}>⏱ {trip.duration}</span>
                {trip.fare > 0 && <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>₺{trip.fare}</span>}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <NavBar />
    </div>
  );
}
