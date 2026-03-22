'use client';

import { useState } from 'react';
import { useStore, apiRegister } from '@/lib/store';
import { Glow, Card } from '../Layout';

export default function RegisterPage() {
  const { setPage, setUser, setToken } = useStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleRegister = async () => {
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Ad, e-posta ve şifre zorunludur.'); return; }
    setLoading(true);
    try {
      const [firstName, ...rest] = form.name.trim().split(' ');
      const lastName = rest.join(' ') || firstName;
      const data = await apiRegister({ firstName, lastName, email: form.email, phone: form.phone || '0000', password: form.password });
      setToken(data.token);
      setUser({ id: data.user.id, name: data.user.name, email: data.user.email, phone: data.user.phone });
      setPage('home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'AD SOYAD', placeholder: 'Adınız Soyadınız', type: 'text' },
    { key: 'email', label: 'E-POSTA', placeholder: 'ornek@peng.ae', type: 'email' },
    { key: 'phone', label: 'TELEFON', placeholder: '+90 555 000 0000', type: 'tel' },
    { key: 'password', label: 'ŞİFRE', placeholder: 'En az 8 karakter', type: 'password' },
  ] as const;

  return (
    <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Glow color="#EC4899" top="-100px" right="-80px" />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
        <button onClick={() => setPage('login')} style={{
          background: 'none', border: 'none', color: '#6B7280',
          fontSize: 14, cursor: 'pointer', marginBottom: 24,
        }}>← Geri</button>

        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Hesap Oluştur</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>PENG ile güvenli yolculuğa başlayın</p>

        <Card style={{ padding: 28 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 20,
              color: '#FCA5A5', fontSize: 13,
            }}>{error}</div>
          )}

          {fields.map((f, i) => (
            <div key={f.key} style={{ marginBottom: i < fields.length - 1 ? 18 : 0 }}>
              <label style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
                {f.label}
              </label>
              <input
                type={f.type} value={form[f.key]} onChange={update(f.key)}
                placeholder={f.placeholder}
              />
            </div>
          ))}

          <button className="btn-primary" onClick={handleRegister} disabled={loading}
            style={{ width: '100%', marginTop: 24, fontSize: 15 }}>
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol →'}
          </button>
        </Card>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#6B7280', fontSize: 13 }}>
          Kayıt olarak{' '}
          <span style={{ color: '#818CF8' }}>Kullanım Şartlarını</span>
          {' '}kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}
