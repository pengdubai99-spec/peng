/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001',
    NEXT_PUBLIC_TRIP_URL: process.env.NEXT_PUBLIC_TRIP_URL || 'http://localhost:3002',
    NEXT_PUBLIC_TRACKING_URL: process.env.NEXT_PUBLIC_TRACKING_URL || 'http://localhost:3003',
  },
};

module.exports = nextConfig;
