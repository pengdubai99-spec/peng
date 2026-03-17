import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PENG - Güvenli Yolculuk',
  description: 'PENG ile güvenli, akıllı ve konforlu yolculuk deneyimi yaşayın.',
  icons: { icon: '/icon.png' },
  openGraph: {
    title: 'PENG - Güvenli Yolculuk',
    description: 'AI destekli akıllı ulaşım platformu',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
