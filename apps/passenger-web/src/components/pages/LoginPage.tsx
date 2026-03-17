'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Glow, PengLogo, Card } from '../Layout';

export default function LoginPage() {
  const { setPage, setUser, setToken } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('E-posta ve şifre gerekli.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setToken(data.token);
      setUser({ id: data.user.id, name: data.user.name, email: data.user.email, phone: data.user.phone });
      setPage('home');
    } catch {
      if (email === 'demo@peng.ae' && password === 'demo') {
        setToken('demo-token');
        setUser({ id: 'demo', name: 'Demo Kullanıcı', email: 'demo@peng.ae' });
        setPage('home');
      } else {
        setError('E-posta veya şifre hatalı. Demo: demo@peng.ae / demo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Glow color="#6366F1" top="-100px" left="-80px" />
      <Glow color="#EC4899" bottom="-80px" right="-60px" />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <PengLogo size={72} />
          </div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>PENG</h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginTop: 6 }}>Hesabınıza giriş yapın</p>
        </div>

        <Card style={{ padding: 28 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 20,
              color: '#FCA5A5', fontSize: 13,
            }}>{error}</div>
          )}

          <label style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>E-POSTA</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="ornek@peng.ae" autoComplete="email"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />

          <label style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, display: 'block', margin: '18px 0 8px' }}>ŞİFRE</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Şifrenizi girin" style={{ paddingRight: 70 }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button onClick={() => setShowPass(!showPass)} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6B7280', fontSize: 11, fontWeight: 700,
            }}>{showPass ? 'GİZLE' : 'GÖSTER'}</button>
          </div>

          <button className="btn-primary" onClick={handleLogin} disabled={loading}
            style={{ width: '100%', marginTop: 24, fontSize: 15 }}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
          </button>

          <button onClick={() => {
            setToken('demo-token');
            setUser({ id: 'demo', name: 'Demo Kullanıcı', email: 'demo@peng.ae' });
            setPage('home');
          }} style={{
            width: '100%', marginTop: 12, background: 'none', border: 'none',
            color: '#818CF8', fontSize: 13, cursor: 'pointer', padding: '8px',
          }}>Demo ile dene →</button>
        </Card>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#6B7280', fontSize: 14 }}>
          Hesabınız yok mu?{' '}
          <button onClick={() => setPage('register')} style={{
            background: 'none', border: 'none', color: '#818CF8', fontWeight: 700,
            cursor: 'pointer', fontSize: 14,
          }}>Kayıt Ol</button>
        </p>

        <button onClick={() => setPage('home')} style={{
          display: 'block', margin: '16px auto 0',
          background: 'none', border: 'none', color: '#4B5563',
          fontSize: 13, cursor: 'pointer',
        }}>← Ana Sayfaya Dön</button>
      </div>
    </div>
  );
}
