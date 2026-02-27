# WebRTC Canlı Video Streaming - Uygulama Planı

## Özet
Sürücü telefonundan (React Native) canlı kamera görüntüsünü WebRTC ile dashboard/admin paneline stream etmek. Mevcut tracking-service signaling sunucusu olarak kullanılacak. Başlangıçta Google STUN (ücretsiz), ilerleyen aşamada TURN eklenecek.

## Adımlar

### Adım 1: Shared Types - WebRTC Signaling Eventleri
**Dosya:** `packages/shared-types/src/location.ts`
- `SocketEvents` enum'una yeni eventler eklenir:
  - `WEBRTC_OFFER` = `'webrtc:offer'`
  - `WEBRTC_ANSWER` = `'webrtc:answer'`
  - `WEBRTC_ICE_CANDIDATE` = `'webrtc:ice-candidate'`
  - `WEBRTC_START_STREAM` = `'webrtc:start-stream'`
  - `WEBRTC_STOP_STREAM` = `'webrtc:stop-stream'`
  - `WEBRTC_REQUEST_STREAM` = `'webrtc:request-stream'`
- Yeni interface'ler:
  - `WebRTCOffer { vehicleId, sdp }`
  - `WebRTCAnswer { vehicleId, viewerId, sdp }`
  - `WebRTCIceCandidate { vehicleId, viewerId, candidate }`

### Adım 2: Tracking Service - Signaling Gateway
**Dosya:** `services/tracking-service/src/gateways/tracking.gateway.ts`
- Mevcut gateway'e WebRTC signaling eventleri eklenir:
  - `webrtc:start-stream` → Sürücü yayın başlattığında, vehicleId'yi aktif yayıncılar listesine ekle
  - `webrtc:stop-stream` → Yayını durdur
  - `webrtc:request-stream` → İzleyici video talep ettiğinde, sürücüye offer isteği gönder
  - `webrtc:offer` → SDP offer'ı sürücüden izleyiciye ilet
  - `webrtc:answer` → SDP answer'ı izleyiciden sürücüye ilet
  - `webrtc:ice-candidate` → ICE candidate'leri karşılıklı ilet
- Aktif yayıncıları tutan in-memory Map: `Map<vehicleId, socketId>`

### Adım 3: Mobil Uygulama - WebRTC Entegrasyonu
**Dosya:** `apps/mobile/App.tsx`
- `react-native-webrtc` kullanılarak:
  - Sistem aktif edildiğinde (`toggleDuty` içinde):
    1. `mediaDevices.getUserMedia({ video: true, audio: false })` ile kamera stream al
    2. `RTCPeerConnection` oluştur (ICE servers: Google STUN)
    3. Stream'i peer connection'a ekle
    4. Socket üzerinden `webrtc:start-stream` gönder
  - İzleyici talep ettiğinde (`webrtc:request-stream` geldiğinde):
    1. SDP offer oluştur
    2. Socket üzerinden `webrtc:offer` gönder
    3. Answer geldiğinde set et
    4. ICE candidate'leri karşılıklı gönder
  - Sistem kapatıldığında tüm peer connection'ları kapat

- **Expo uyumluluğu:** `react-native-webrtc` native modül olduğu için `app.json`'a expo plugin olarak eklenecek. Expo SDK 52 ile `expo-dev-client` kullanılacak (prebuild gerekli).

### Adım 4: Mobil Bağımlılıkları Kur
- `react-native-webrtc` paketini kur
- `app.json`'a Android/iOS izinleri ekle:
  - Android: `CAMERA`, `RECORD_AUDIO`, `INTERNET`, `ACCESS_NETWORK_STATE`
  - iOS: `NSCameraUsageDescription`
- `expo prebuild` çalıştır (dev build için)

### Adım 5: Dashboard - Video İzleme Sayfası (Basit HTML)
**Dosya:** `services/tracking-service/src/public/viewer.html` (statik dosya olarak serve edilecek)
- Basit bir HTML sayfası (ayrı Next.js app'e gerek yok, ilk aşamada):
  - Socket.io client ile tracking-service'e bağlan
  - vehicleId gir ve `webrtc:request-stream` gönder
  - Gelen offer'a answer oluştur
  - ICE candidate alışverişi yap
  - `<video>` elementinde canlı görüntüyü göster
  - GPS konumu harita üzerinde göster (basit Leaflet/OpenStreetMap)
- Tracking service `main.ts`'de statik dosya servisi aktif edilecek

### Adım 6: Tracking Service - Statik Dosya Servisi
**Dosya:** `services/tracking-service/src/main.ts`
- NestJS uygulamasına `app.useStaticAssets('src/public')` eklenir
- `viewer.html` sayfası `http://localhost:3003/viewer.html` adresinden erişilebilir olur

## ICE Server Konfigürasyonu (Başlangıç)
```javascript
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
```

## Dosya Değişiklik Özeti
| Dosya | İşlem |
|-------|-------|
| `packages/shared-types/src/location.ts` | Düzenle (yeni eventler + interface'ler) |
| `services/tracking-service/src/gateways/tracking.gateway.ts` | Düzenle (signaling handler'ları) |
| `services/tracking-service/src/main.ts` | Düzenle (static assets) |
| `services/tracking-service/src/public/viewer.html` | Yeni (izleme sayfası) |
| `apps/mobile/package.json` | Düzenle (react-native-webrtc ekle) |
| `apps/mobile/app.json` | Düzenle (izinler) |
| `apps/mobile/App.tsx` | Düzenle (WebRTC entegrasyonu) |
