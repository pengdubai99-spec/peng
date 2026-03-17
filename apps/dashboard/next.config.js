/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output - Railway/Docker için (her zaman aktif)
  output: 'standalone',

  // Environment variables (public - client'ta erişilebilir)
  env: {
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001',
    NEXT_PUBLIC_TRIP_URL: process.env.NEXT_PUBLIC_TRIP_URL || 'http://localhost:3002',
    NEXT_PUBLIC_TRACKING_URL: process.env.NEXT_PUBLIC_TRACKING_URL || 'http://localhost:3003',
    NEXT_PUBLIC_LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://peng-cantak-3avcr64w.livekit.cloud',
  },

  // CORS / proxy yapılandırması (geliştirme)
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          { source: '/api/auth/:path*', destination: 'http://localhost:3001/:path*' },
          { source: '/api/trips/:path*', destination: 'http://localhost:3002/:path*' },
          { source: '/api/tracking/:path*', destination: 'http://localhost:3003/:path*' },
        ]
      : [];
  },

  // Image optimize (Leaflet gibi dış kaynaklar için)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.tile.openstreetmap.org' },
      { protocol: 'https', hostname: 'unpkg.com' },
    ],
  },

  // TypeScript/ESLint hataları build'i durdurmasın
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

module.exports = nextConfig;
