# SafeRide Admin Panel

> ⚠️ Bu uygulama henüz geliştirilmemiştir.

## Planlanan Özellikler

- Admin dashboard (Filo yönetimi, kullanıcı yönetimi)
- Araç/sürücü izleme paneli
- Trip raporları ve istatistikler
- Geofence yönetimi

## Başlamak İçin

```bash
# Geliştirme ortamını kurmak için:
# 1. Framework seçimi yapılmalı (önerilen: Next.js)
# 2. npx create-next-app@latest ./ ile başlatılabilir
```

## İlişkili Servisler

- `services/auth-service` — Kimlik doğrulama
- `services/trip-service` — Trip yönetimi
- `services/tracking-service` — Canlı izleme & WebSocket
- `apps/dashboard` — Mevcut dashboard (referans olarak kullanılabilir)
