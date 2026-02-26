# SafeRide

Taksi / VTC Araç İçi Kamera & GPS Takip Uygulaması

## 🏗️ Proje Yapısı

```
saferide/
├── apps/                    # Frontend uygulamalar
│   ├── mobile/              # React Native (Expo) - Yolcu + Sürücü
│   ├── dashboard/           # Next.js - Filo Yönetim Paneli
│   └── admin/               # Next.js - Admin Paneli
├── services/                # Backend mikroservisler
│   ├── auth-service/        # Kimlik doğrulama (NestJS)
│   ├── trip-service/        # Yolculuk yönetimi
│   ├── tracking-service/    # GPS takip (WebSocket)
│   ├── video-service/       # Video streaming
│   ├── notification-service/# Bildirimler
│   ├── fleet-service/       # Filo yönetimi
│   └── ai-service/          # AI/ML (Python FastAPI)
├── packages/                # Paylaşılan paketler
│   └── shared-types/        # Ortak TypeScript tipleri
└── infra/                   # Docker & Kubernetes
```

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Kurulum

```bash
# Projeyi klonla
git clone <repo-url> saferide
cd saferide

# Bağımlılıkları yükle
pnpm install

# Docker ile veritabanlarını başlat
docker compose -f infra/docker/docker-compose.yml up -d

# Environment dosyasını oluştur
cp services/auth-service/.env.example services/auth-service/.env

# Veritabanı migration
pnpm --filter @saferide/auth-service prisma:migrate

# Tüm servisleri geliştirme modunda başlat
pnpm dev
```

### Erişim

- 🔐 Auth API: http://localhost:3001
- 📄 API Docs: http://localhost:3001/docs
- 🗄️ Adminer (DB): http://localhost:8080
- 📊 Redis Commander: http://localhost:8081

## 📖 Teknoloji Stack

| Katman         | Teknoloji             |
| -------------- | --------------------- |
| Mobil          | React Native (Expo)   |
| Web            | Next.js               |
| Backend        | NestJS (TypeScript)   |
| AI/ML          | Python FastAPI        |
| Veritabanı     | PostgreSQL + Prisma   |
| Cache          | Redis                 |
| Mesaj Kuyruğu  | Apache Kafka          |
| Gerçek Zamanlı | WebSocket (Socket.io) |
| Monorepo       | Turborepo + pnpm      |
| CI/CD          | GitHub Actions        |
