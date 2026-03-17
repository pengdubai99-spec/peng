import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { useStore } from './src/store/useStore';
import { login, register, MOCK_DRIVERS } from './src/api/client';
import type { Driver, Trip } from './src/store/useStore';

const { width, height } = Dimensions.get('window');

// ==========================================
// TEMA / RENKLER
// ==========================================
const C = {
  bg: '#050510',
  card: '#0D0D1A',
  border: '#1A1A2E',
  purple: '#6366F1',
  purpleLight: '#818CF8',
  pink: '#EC4899',
  gradient1: '#6366F1',
  gradient2: '#EC4899',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  textDim: '#4B5563',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  overlay: 'rgba(5,5,16,0.95)',
};

// ==========================================
// YARDIMCI BILEŞENLER
// ==========================================
function GradientText({ style, children }: { style?: any; children: string }) {
  return (
    <Text style={[style, { color: C.purpleLight }]}>{children}</Text>
  );
}

function PengLogo({ size = 36 }: { size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size * 0.28,
      backgroundColor: C.purple,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: '#fff', fontSize: size * 0.4, fontWeight: '900' }}>P</Text>
    </View>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Text style={{ color: C.warning, fontSize: 12 }}>★</Text>
      <Text style={{ color: C.text, fontSize: 12, fontWeight: '600' }}>{rating.toFixed(1)}</Text>
    </View>
  );
}

function Pill({ label, color = C.purple }: { label: string; color?: string }) {
  return (
    <View style={{ backgroundColor: color + '22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>{label}</Text>
    </View>
  );
}

// Avatar dairesi (ismin baş harfleri)
function Avatar({ initials, size = 44, bg = C.purple }: { initials: string; size?: number; bg?: string }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: bg, alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}

// ==========================================
// EKRAN: SPLASH
// ==========================================
function SplashScreen() {
  const setScreen = useStore((s) => s.setScreen);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => setScreen('login'), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={[s.fill, s.center, { backgroundColor: C.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <Animated.View style={{ alignItems: 'center', opacity, transform: [{ scale }] }}>
        <View style={{
          width: 100, height: 100, borderRadius: 28,
          backgroundColor: C.purple,
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          shadowColor: C.purple, shadowOpacity: 0.6, shadowRadius: 30, shadowOffset: { width: 0, height: 0 },
        }}>
          <Text style={{ color: '#fff', fontSize: 52, fontWeight: '900' }}>P</Text>
        </View>
        <Text style={{ color: C.text, fontSize: 38, fontWeight: '900', letterSpacing: -1 }}>PENG</Text>
        <Text style={{ color: C.textMuted, fontSize: 14, marginTop: 6 }}>Güvenli ve Akıllı Yolculuk</Text>
      </Animated.View>
    </View>
  );
}

// ==========================================
// EKRAN: GİRİŞ
// ==========================================
function LoginScreen() {
  const { setScreen, setUser, setToken } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre gereklidir.');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      const { token, user } = res.data;
      setToken(token);
      setUser({ id: user.id, name: user.name, email: user.email, phone: user.phone });
      setScreen('home');
    } catch (err: any) {
      // Demo modu: API yoksa demo kullanıcısıyla giriş
      if (email === 'demo@peng.ae' && password === 'demo') {
        setToken('demo-token');
        setUser({ id: 'demo-passenger', name: 'Demo Kullanıcı', email: 'demo@peng.ae', phone: '+90 555 000 0000' });
        setScreen('home');
      } else {
        Alert.alert('Giriş Başarısız', 'E-posta veya şifre hatalı.\n\nDemo için: demo@peng.ae / demo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[s.fill, { backgroundColor: C.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      {/* Glow efekti */}
      <View style={[s.glow, { top: -120, left: -60, backgroundColor: C.purple }]} />
      <View style={[s.glow, { bottom: -80, right: -60, backgroundColor: C.pink }]} />

      <ScrollView contentContainerStyle={[s.center, { flexGrow: 1, paddingHorizontal: 28, paddingVertical: 60 }]}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={[s.logoBox, { shadowColor: C.purple }]}>
            <Text style={{ color: '#fff', fontSize: 36, fontWeight: '900' }}>P</Text>
          </View>
          <Text style={s.logoText}>PENG</Text>
          <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>Hesabınıza giriş yapın</Text>
        </View>

        {/* Form */}
        <View style={[s.card, { width: '100%', padding: 24 }]}>
          <Text style={s.label}>E-POSTA</Text>
          <TextInput
            style={s.input}
            placeholder="ornek@peng.ae"
            placeholderTextColor={C.textDim}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[s.label, { marginTop: 16 }]}>ŞİFRE</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[s.input, { paddingRight: 48 }]}
              placeholder="Şifrenizi girin"
              placeholderTextColor={C.textDim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity
              style={{ position: 'absolute', right: 14, top: 14 }}
              onPress={() => setShowPass(!showPass)}
            >
              <Text style={{ color: C.textMuted, fontSize: 12 }}>{showPass ? 'GİZLE' : 'GÖSTER'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[s.btn, { marginTop: 24 }]} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Giriş Yap →</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => setScreen('home')}>
            <Text style={{ color: C.purpleLight, fontSize: 13 }}>Demo ile dene (giriş olmadan)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={{ marginTop: 24 }} onPress={() => setScreen('register')}>
          <Text style={{ color: C.textMuted, fontSize: 14 }}>
            Hesabınız yok mu? <Text style={{ color: C.purpleLight, fontWeight: '700' }}>Kayıt Ol</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// EKRAN: KAYIT
// ==========================================
function RegisterScreen() {
  const { setScreen, setUser, setToken } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Hata', 'Ad, e-posta ve şifre zorunludur.');
      return;
    }
    setLoading(true);
    try {
      const res = await register(name, email.trim(), password, phone);
      const { token, user } = res.data;
      setToken(token);
      setUser({ id: user.id, name: user.name, email: user.email, phone: user.phone });
      setScreen('home');
    } catch (err: any) {
      Alert.alert('Kayıt Başarısız', err?.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[s.fill, { backgroundColor: C.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={[s.glow, { top: -100, right: -60, backgroundColor: C.pink }]} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => setScreen('login')} style={{ marginBottom: 30 }}>
          <Text style={{ color: C.textMuted, fontSize: 14 }}>← Geri</Text>
        </TouchableOpacity>

        <Text style={{ color: C.text, fontSize: 28, fontWeight: '900', marginBottom: 6 }}>Hesap Oluştur</Text>
        <Text style={{ color: C.textMuted, fontSize: 14, marginBottom: 32 }}>PENG ile güvenli yolculuğa başlayın</Text>

        <View style={[s.card, { padding: 24 }]}>
          {[
            { label: 'AD SOYAD', value: name, setter: setName, placeholder: 'Adınız Soyadınız' },
            { label: 'E-POSTA', value: email, setter: setEmail, placeholder: 'ornek@peng.ae', keyboard: 'email-address' as const },
            { label: 'TELEFON', value: phone, setter: setPhone, placeholder: '+90 555 000 0000', keyboard: 'phone-pad' as const },
            { label: 'ŞİFRE', value: password, setter: setPassword, placeholder: 'En az 8 karakter', secure: true },
          ].map((field, i) => (
            <View key={i} style={{ marginBottom: i < 3 ? 16 : 0 }}>
              <Text style={s.label}>{field.label}</Text>
              <TextInput
                style={s.input}
                placeholder={field.placeholder}
                placeholderTextColor={C.textDim}
                value={field.value}
                onChangeText={field.setter}
                keyboardType={field.keyboard}
                autoCapitalize="none"
                secureTextEntry={field.secure}
              />
            </View>
          ))}

          <TouchableOpacity style={[s.btn, { marginTop: 24 }]} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Kayıt Ol →</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// EKRAN: ANASAYFA (HARİTA + BOOKING)
// ==========================================
function HomeScreen() {
  const { setScreen, user, setDestination, setDestinationCoords, userLocation, setUserLocation } = useStore();
  const [dest, setDest] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const quickDestinations = [
    { icon: '🏢', label: 'İş', address: 'Levent, İstanbul' },
    { icon: '🏠', label: 'Ev', address: 'Kadıköy, İstanbul' },
    { icon: '✈️', label: 'Havalimanı', address: 'İstanbul Havalimanı' },
    { icon: '🛍️', label: 'AVM', address: 'İstinye Park AVM' },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationLoading(true);
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        setLocationLoading(false);
      }
    })();
  }, []);

  const handleSearch = () => {
    if (!dest.trim()) return;
    setDestination(dest.trim());
    setScreen('selectDriver');
  };

  const handleQuick = (address: string) => {
    setDestination(address);
    setScreen('selectDriver');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: C.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '600' }}>Merhaba 👋</Text>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: '800' }}>
            {user?.name?.split(' ')[0] || 'Misafir'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setScreen('profile')}>
          <Avatar initials={initials} size={42} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Harita Placeholder */}
        <View style={s.mapBox}>
          <View style={s.mapDark}>
            {/* Grid çizgileri */}
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={`h${i}`} style={{
                position: 'absolute', left: 0, right: 0,
                top: (i + 1) * (200 / 7),
                height: 1, backgroundColor: 'rgba(99,102,241,0.1)',
              }} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={`v${i}`} style={{
                position: 'absolute', top: 0, bottom: 0,
                left: (i + 1) * (width / 9),
                width: 1, backgroundColor: 'rgba(99,102,241,0.1)',
              }} />
            ))}
            {/* Glow merkezi */}
            <View style={{
              width: 120, height: 120, borderRadius: 60,
              backgroundColor: C.purple + '15',
              position: 'absolute',
              top: '50%', left: '50%',
              marginLeft: -60, marginTop: -60,
            }} />
            {/* Konum pin */}
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 56, height: 56, borderRadius: 28,
                backgroundColor: C.purple,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: C.purple, shadowOpacity: 0.7, shadowRadius: 20,
                shadowOffset: { width: 0, height: 0 },
              }}>
                <Text style={{ fontSize: 24 }}>📍</Text>
              </View>
              <View style={{
                width: 12, height: 12, borderRadius: 6,
                backgroundColor: C.purple + '44',
                marginTop: 4,
              }} />
            </View>
            {locationLoading && (
              <View style={{ position: 'absolute', bottom: 12, right: 12 }}>
                <ActivityIndicator color={C.purple} size="small" />
              </View>
            )}
            {userLocation && (
              <View style={{
                position: 'absolute', bottom: 12, left: 12,
                backgroundColor: C.card, borderRadius: 8,
                padding: 6, borderWidth: 1, borderColor: C.border,
              }}>
                <Text style={{ color: C.success, fontSize: 10, fontWeight: '700' }}>● Konum Alındı</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {/* Arama kutusu */}
          <View style={[s.card, { flexDirection: 'row', alignItems: 'center', padding: 0, overflow: 'hidden' }]}>
            <View style={{ paddingLeft: 16, paddingRight: 10 }}>
              <Text style={{ fontSize: 20 }}>🔍</Text>
            </View>
            <TextInput
              style={{ flex: 1, color: C.text, fontSize: 15, paddingVertical: 16, paddingRight: 12 }}
              placeholder="Nereye gitmek istiyorsunuz?"
              placeholderTextColor={C.textDim}
              value={dest}
              onChangeText={setDest}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {dest.length > 0 && (
              <TouchableOpacity onPress={handleSearch} style={{ paddingRight: 16 }}>
                <View style={{
                  backgroundColor: C.purple, borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 8,
                }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Git</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Hızlı hedefler */}
          <Text style={[s.sectionTitle, { marginTop: 24 }]}>Sık Gidilen Yerler</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
            {quickDestinations.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[s.card, { flex: 1, minWidth: '44%', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }]}
                onPress={() => handleQuick(d.address)}
              >
                <Text style={{ fontSize: 22 }}>{d.icon}</Text>
                <View>
                  <Text style={{ color: C.text, fontWeight: '700', fontSize: 13 }}>{d.label}</Text>
                  <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }} numberOfLines={1}>{d.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Alt navigasyon */}
          <View style={[s.bottomNav]}>
            <NavBtn icon="🏠" label="Ana Sayfa" active onPress={() => {}} />
            <NavBtn icon="🕐" label="Geçmiş" onPress={() => setScreen('history')} />
            <NavBtn icon="👤" label="Profil" onPress={() => setScreen('profile')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NavBtn({ icon, label, active, onPress }: { icon: string; label: string; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={{ alignItems: 'center', flex: 1 }} onPress={onPress}>
      <Text style={{ fontSize: 22, marginBottom: 4 }}>{icon}</Text>
      <Text style={{ color: active ? C.purpleLight : C.textMuted, fontSize: 11, fontWeight: active ? '700' : '500' }}>{label}</Text>
      {active && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.purple, marginTop: 3 }} />}
    </TouchableOpacity>
  );
}

// ==========================================
// EKRAN: SÜRÜCÜ SEÇ
// ==========================================
function SelectDriverScreen() {
  const { setScreen, destination, setSelectedDriver } = useStore();
  const [selected, setSelected] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!selected) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSelectedDriver(selected);
    setLoading(false);
    setScreen('activeRide');
  };

  const rideTypes = [
    { id: 'economy', label: 'Ekonomik', multiplier: 1.0, desc: 'Uygun fiyat' },
    { id: 'comfort', label: 'Konfor', multiplier: 1.4, desc: 'Geniş ve rahat' },
    { id: 'premium', label: 'Premium', multiplier: 2.0, desc: 'Lüks araç' },
  ];
  const [rideType, setRideType] = useState('economy');

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: C.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setScreen('home')}>
          <Text style={{ color: C.textMuted, fontSize: 14 }}>← Geri</Text>
        </TouchableOpacity>
        <Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>Sürücü Seç</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
        {/* Hedef */}
        <View style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }]}>
          <Text style={{ fontSize: 22 }}>📍</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.textMuted, fontSize: 11 }}>HEDEF</Text>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }}>{destination}</Text>
          </View>
          <TouchableOpacity onPress={() => setScreen('home')}>
            <Text style={{ color: C.purple, fontSize: 13 }}>Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* Yolculuk tipi */}
        <Text style={[s.sectionTitle, { marginTop: 20 }]}>Yolculuk Tipi</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {rideTypes.map(rt => (
            <TouchableOpacity
              key={rt.id}
              style={[
                s.card,
                { flex: 1, padding: 12, alignItems: 'center' },
                rideType === rt.id && { borderColor: C.purple, borderWidth: 1.5, backgroundColor: C.purple + '15' },
              ]}
              onPress={() => setRideType(rt.id)}
            >
              <Text style={{ fontSize: 18 }}>
                {rt.id === 'economy' ? '🚗' : rt.id === 'comfort' ? '🚙' : '✨'}
              </Text>
              <Text style={{ color: rideType === rt.id ? C.purpleLight : C.text, fontWeight: '700', fontSize: 12, marginTop: 6 }}>
                {rt.label}
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>{rt.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Yakındaki sürücüler */}
        <Text style={[s.sectionTitle, { marginTop: 24 }]}>Yakındaki Sürücüler</Text>
        <View style={{ gap: 10, marginTop: 10 }}>
          {MOCK_DRIVERS.map(driver => {
            const mult = rideTypes.find(r => r.id === rideType)?.multiplier || 1;
            const fare = Math.round(45 * mult + Math.random() * 10);
            const isSelected = selected?.id === driver.id;

            return (
              <TouchableOpacity
                key={driver.id}
                style={[
                  s.card,
                  { padding: 16 },
                  isSelected && { borderColor: C.purple, borderWidth: 1.5, backgroundColor: C.purple + '10' },
                ]}
                onPress={() => setSelected(driver)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Avatar initials={driver.avatar} size={52} bg={isSelected ? C.purple : '#1A1A2E'} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.text, fontWeight: '800', fontSize: 15 }}>{driver.name}</Text>
                    <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                      {driver.model} · {driver.color} · {driver.plate}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <StarRating rating={driver.rating} />
                      <Text style={{ color: C.textDim, fontSize: 12 }}>·</Text>
                      <Text style={{ color: C.success, fontSize: 12, fontWeight: '600' }}>{driver.eta}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: C.text, fontWeight: '900', fontSize: 18 }}>₺{fare}</Text>
                    <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>tahmini</Text>
                  </View>
                </View>

                {isSelected && (
                  <View style={{
                    marginTop: 12, paddingTop: 12,
                    borderTopWidth: 1, borderTopColor: C.purple + '33',
                    flexDirection: 'row', gap: 8,
                  }}>
                    <Pill label="✓ Seçildi" color={C.success} />
                    <Pill label={`ETA ${driver.eta}`} color={C.purple} />
                    <Pill label={`⭐ ${driver.rating}`} color={C.warning} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Rezervasyon butonu */}
      {selected && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: 20, backgroundColor: C.overlay,
          borderTopWidth: 1, borderTopColor: C.border,
        }}>
          <TouchableOpacity style={s.btn} onPress={handleBook} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>
                  {selected.name} ile Yolculuğu Başlat →
                </Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ==========================================
// EKRAN: AKTİF YOLCULUK
// ==========================================
function ActiveRideScreen() {
  const { setScreen, selectedDriver, destination, setActiveTrip } = useStore();
  const [status, setStatus] = useState<'waiting' | 'onway' | 'arrived' | 'inride' | 'completed'>('waiting');
  const [elapsed, setElapsed] = useState(0);
  const [showRate, setShowRate] = useState(false);
  const [rating, setRating] = useState(0);

  // Otomatik durum geçişleri simülasyonu
  useEffect(() => {
    const timers = [
      setTimeout(() => setStatus('onway'), 3000),
      setTimeout(() => setStatus('arrived'), 12000),
      setTimeout(() => setStatus('inride'), 16000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Süre sayacı
  useEffect(() => {
    if (status !== 'inride') return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const statusInfo = {
    waiting: { label: 'Sürücü Bekleniyor...', color: C.warning, icon: '⏳' },
    onway: { label: 'Sürücü Yolda', color: C.purple, icon: '🚗' },
    arrived: { label: 'Sürücü Kapıda!', color: C.success, icon: '✅' },
    inride: { label: 'Yolculuk Devam Ediyor', color: C.success, icon: '🛣️' },
    completed: { label: 'Yolculuk Tamamlandı', color: C.textMuted, icon: '🏁' },
  };

  const handleComplete = () => {
    setStatus('completed');
    setShowRate(true);
  };

  const handleRate = () => {
    setShowRate(false);
    setActiveTrip(null);
    setScreen('home');
    Alert.alert('Teşekkürler!', 'Değerlendirmeniz için teşekkür ederiz.');
  };

  const info = statusInfo[status];

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: C.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Glow */}
      <View style={[s.glow, { top: -80, left: -80, backgroundColor: info.color }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
        {/* Durum kartı */}
        <View style={[s.card, { alignItems: 'center', padding: 24 }]}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>{info.icon}</Text>
          <Text style={{ color: info.color, fontWeight: '800', fontSize: 18 }}>{info.label}</Text>
          {status === 'inride' && (
            <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 8 }}>
              Süre: {formatTime(elapsed)}
            </Text>
          )}
          {status === 'onway' && (
            <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 8 }}>
              Tahmini varış: {selectedDriver?.eta}
            </Text>
          )}
        </View>

        {/* Sürücü bilgisi */}
        <View style={[s.card, { marginTop: 16, padding: 20 }]}>
          <Text style={[s.sectionTitle, { marginBottom: 14 }]}>Sürücü Bilgisi</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar initials={selectedDriver?.avatar || 'S'} size={60} bg={C.purple} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>{selectedDriver?.name}</Text>
              <StarRating rating={selectedDriver?.rating || 5} />
              <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>
                {selectedDriver?.model} · {selectedDriver?.color}
              </Text>
              <View style={{
                marginTop: 8, backgroundColor: C.purple + '22',
                borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
                alignSelf: 'flex-start',
              }}>
                <Text style={{ color: C.purple, fontWeight: '800', fontSize: 15, letterSpacing: 2 }}>
                  {selectedDriver?.plate}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: C.success + '22',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 20 }}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rota bilgisi */}
        <View style={[s.card, { marginTop: 16, padding: 20 }]}>
          <Text style={[s.sectionTitle, { marginBottom: 14 }]}>Rota</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center', paddingTop: 2 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.success }} />
              <View style={{ width: 2, height: 40, backgroundColor: C.border, marginVertical: 4 }} />
              <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: C.purple }} />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <View>
                <Text style={{ color: C.textMuted, fontSize: 11 }}>ALIŞ NOKTASI</Text>
                <Text style={{ color: C.text, fontWeight: '600', fontSize: 14, marginTop: 2 }}>Mevcut Konum</Text>
              </View>
              <View style={{ height: 1, backgroundColor: C.border }} />
              <View>
                <Text style={{ color: C.textMuted, fontSize: 11 }}>HEDEFİNİZ</Text>
                <Text style={{ color: C.text, fontWeight: '600', fontSize: 14, marginTop: 2 }}>{destination}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Güvenlik bilgileri */}
        <View style={[s.card, { marginTop: 16, padding: 20 }]}>
          <Text style={[s.sectionTitle, { marginBottom: 14 }]}>Güvenlik</Text>
          <View style={{ gap: 10 }}>
            {[
              { icon: '🛡️', text: 'Yolculuk PENG AI tarafından izleniyor' },
              { icon: '📹', text: 'Araç kamerası aktif' },
              { icon: '📍', text: 'Gerçek zamanlı GPS takip açık' },
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                <Text style={{ color: C.textMuted, fontSize: 13, flex: 1 }}>{item.text}</Text>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.success }} />
              </View>
            ))}
          </View>
        </View>

        {/* SOS Butonu */}
        <TouchableOpacity
          style={{
            marginTop: 16, backgroundColor: '#1A0000',
            borderWidth: 1.5, borderColor: C.error,
            borderRadius: 16, padding: 16,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
          onPress={() => Alert.alert('🚨 SOS', 'Acil yardım bildirimi gönderildi!')}
        >
          <Text style={{ fontSize: 22 }}>🆘</Text>
          <Text style={{ color: C.error, fontWeight: '800', fontSize: 15 }}>ACİL YARDIM (SOS)</Text>
        </TouchableOpacity>

        {status === 'inride' && (
          <TouchableOpacity style={[s.btn, { marginTop: 20, backgroundColor: C.success }]} onPress={handleComplete}>
            <Text style={s.btnText}>Yolculuğu Tamamla ✓</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Değerlendirme Modal */}
      <Modal visible={showRate} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28 }}>
            <Text style={{ color: C.text, fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
              Yolculuk Tamamlandı! 🎉
            </Text>
            <Text style={{ color: C.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
              {selectedDriver?.name} ile yolculuğunuzu değerlendirin
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={{ fontSize: 40, color: star <= rating ? C.warning : C.border }}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.btn} onPress={handleRate}>
              <Text style={s.btnText}>Değerlendirmeyi Gönder →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => { setShowRate(false); setScreen('home'); }}>
              <Text style={{ color: C.textMuted, fontSize: 14 }}>Atla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// EKRAN: GEÇMİŞ
// ==========================================
function HistoryScreen() {
  const { setScreen } = useStore();

  const mockHistory: Trip[] = [
    { id: '1', date: '17 Mar 2026, 14:30', driver: 'Ahmed Mansoor', from: 'Kadıköy', to: 'Levent', status: 'COMPLETED', fare: 78, duration: '42 dk', rating: 5 },
    { id: '2', date: '15 Mar 2026, 09:15', driver: 'Omar Hassan', from: 'Beşiktaş', to: 'Maslak', status: 'COMPLETED', fare: 95, duration: '38 dk', rating: 4 },
    { id: '3', date: '12 Mar 2026, 20:00', driver: 'Khalid Al-Rashid', from: 'Şişli', to: 'Ataşehir', status: 'COMPLETED', fare: 120, duration: '55 dk', rating: 5 },
    { id: '4', date: '8 Mar 2026, 11:45', driver: 'Ahmed Mansoor', from: 'Üsküdar', to: 'Taksim', status: 'CANCELLED', fare: 0, duration: '-' },
    { id: '5', date: '5 Mar 2026, 17:20', driver: 'Omar Hassan', from: 'Sarıyer', to: 'Bağcılar', status: 'COMPLETED', fare: 145, duration: '68 dk', rating: 4 },
  ];

  const statusColors = { COMPLETED: C.success, CANCELLED: C.error, PENDING: C.warning, ACTIVE: C.purple };
  const statusLabels = { COMPLETED: 'Tamamlandı', CANCELLED: 'İptal', PENDING: 'Bekliyor', ACTIVE: 'Devam Ediyor' };

  const totalSpent = mockHistory.filter(t => t.status === 'COMPLETED').reduce((acc, t) => acc + t.fare, 0);
  const completedCount = mockHistory.filter(t => t.status === 'COMPLETED').length;

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: C.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => setScreen('home')}>
          <Text style={{ color: C.textMuted, fontSize: 14 }}>← Geri</Text>
        </TouchableOpacity>
        <Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>Yolculuk Geçmişi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Özet kartları */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 }}>
        <View style={[s.card, { flex: 1, padding: 14, alignItems: 'center' }]}>
          <Text style={{ color: C.purple, fontSize: 24, fontWeight: '900' }}>{completedCount}</Text>
          <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>Yolculuk</Text>
        </View>
        <View style={[s.card, { flex: 1, padding: 14, alignItems: 'center' }]}>
          <Text style={{ color: C.success, fontSize: 24, fontWeight: '900' }}>₺{totalSpent}</Text>
          <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>Toplam Harcama</Text>
        </View>
        <View style={[s.card, { flex: 1, padding: 14, alignItems: 'center' }]}>
          <Text style={{ color: C.warning, fontSize: 24, fontWeight: '900' }}>4.8</Text>
          <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>Ort. Puan</Text>
        </View>
      </View>

      <FlatList
        data={mockHistory}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={[s.card, { padding: 16 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: C.textMuted, fontSize: 12 }}>{item.date}</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {item.rating && (
                  <Pill label={`★ ${item.rating}`} color={C.warning} />
                )}
                <Pill
                  label={statusLabels[item.status]}
                  color={statusColors[item.status]}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ alignItems: 'center', paddingTop: 2 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.success }} />
                <View style={{ width: 1, height: 32, backgroundColor: C.border, marginVertical: 2 }} />
                <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: C.purple }} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }}>{item.from}</Text>
                <View style={{ height: 1, backgroundColor: C.border }} />
                <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }}>{item.to}</Text>
              </View>
            </View>
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between',
              marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border,
            }}>
              <Text style={{ color: C.textMuted, fontSize: 12 }}>🧑‍💼 {item.driver}</Text>
              <Text style={{ color: C.textMuted, fontSize: 12 }}>⏱ {item.duration}</Text>
              {item.fare > 0 && (
                <Text style={{ color: C.text, fontWeight: '800', fontSize: 14 }}>₺{item.fare}</Text>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// ==========================================
// EKRAN: PROFİL
// ==========================================
function ProfileScreen() {
  const { setScreen, user, logout } = useStore();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  const menuItems = [
    { icon: '👤', label: 'Hesap Bilgileri', onPress: () => {} },
    { icon: '💳', label: 'Ödeme Yöntemleri', onPress: () => {} },
    { icon: '🔔', label: 'Bildirimler', onPress: () => {} },
    { icon: '🛡️', label: 'Gizlilik & Güvenlik', onPress: () => {} },
    { icon: '🌍', label: 'Dil', onPress: () => {} },
    { icon: '❓', label: 'Yardım & Destek', onPress: () => {} },
    { icon: '⭐', label: 'Uygulamayı Değerlendir', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: C.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => setScreen('home')}>
          <Text style={{ color: C.textMuted, fontSize: 14 }}>← Geri</Text>
        </TouchableOpacity>
        <Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>Profilim</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Profil kartı */}
        <View style={[s.card, { alignItems: 'center', padding: 28, marginBottom: 20 }]}>
          <View style={{ position: 'relative' }}>
            <Avatar initials={initials} size={88} bg={C.purple} />
            <TouchableOpacity style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: C.card, borderWidth: 2, borderColor: C.border,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 14 }}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: C.text, fontSize: 22, fontWeight: '900', marginTop: 14 }}>
            {user?.name || 'Demo Kullanıcı'}
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 14, marginTop: 4 }}>
            {user?.email || 'demo@peng.ae'}
          </Text>
          {user?.phone && (
            <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>{user.phone}</Text>
          )}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <Pill label="✓ Doğrulandı" color={C.success} />
            <Pill label="PENG Üye" color={C.purple} />
          </View>
        </View>

        {/* İstatistikler */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Yolculuk', value: '5' },
            { label: 'Puan', value: '4.8★' },
            { label: 'Bu Ay', value: '₺438' },
          ].map((stat, i) => (
            <View key={i} style={[s.card, { flex: 1, padding: 14, alignItems: 'center' }]}>
              <Text style={{ color: C.purpleLight, fontSize: 20, fontWeight: '900' }}>{stat.value}</Text>
              <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menü */}
        <View style={s.card}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={{
                flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
                borderBottomWidth: i < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: C.border,
              }}
              onPress={item.onPress}
            >
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              <Text style={{ flex: 1, color: C.text, fontSize: 14, fontWeight: '500' }}>{item.label}</Text>
              <Text style={{ color: C.textDim, fontSize: 16 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Çıkış */}
        <TouchableOpacity
          style={{
            marginTop: 16, borderWidth: 1, borderColor: C.error + '44',
            borderRadius: 16, padding: 16,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
          onPress={() => {
            Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinizden emin misiniz?', [
              { text: 'İptal', style: 'cancel' },
              { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
            ]);
          }}
        >
          <Text style={{ fontSize: 18 }}>🚪</Text>
          <Text style={{ color: C.error, fontWeight: '700', fontSize: 15 }}>Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={{ color: C.textDim, fontSize: 11, textAlign: 'center', marginTop: 20 }}>
          PENG Customer v1.0.0 · © 2026 PENG
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// STILLER
// ==========================================
const s = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  glow: {
    position: 'absolute',
    width: 280, height: 280,
    borderRadius: 140,
    opacity: 0.08,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logoBox: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: C.purple,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 0 },
  },
  logoText: { color: C.text, fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  label: { color: C.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  input: {
    backgroundColor: '#0A0A14',
    borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    color: C.text, fontSize: 15,
  },
  btn: {
    backgroundColor: C.purple,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.purple, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  mapBox: { height: 200, marginHorizontal: 0, overflow: 'hidden' },
  mapDark: {
    flex: 1,
    backgroundColor: '#080818',
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { color: C.text, fontSize: 16, fontWeight: '800' },
  bottomNav: {
    flexDirection: 'row',
    marginTop: 28, marginBottom: 8,
    backgroundColor: C.card,
    borderRadius: 20, borderWidth: 1, borderColor: C.border,
    paddingVertical: 14,
  },
});

// ==========================================
// ANA ROUTER
// ==========================================
export default function App() {
  const screen = useStore((s) => s.screen);

  const screens: Record<string, React.ReactNode> = {
    splash: <SplashScreen />,
    login: <LoginScreen />,
    register: <RegisterScreen />,
    home: <HomeScreen />,
    selectDriver: <SelectDriverScreen />,
    activeRide: <ActiveRideScreen />,
    history: <HistoryScreen />,
    profile: <ProfileScreen />,
  };

  return screens[screen] ?? <LoginScreen />;
}
