import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import GoogleProvider from '@/components/providers/GoogleProvider';
import PWAProvider from '@/components/providers/PWAProvider';

export const metadata: Metadata = {
  title: 'TukangBaik – Booking Tukang Bangunan Terpercaya',
  description: 'Temukan dan booking tukang bangunan profesional di sekitar Anda dengan mudah dan aman.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TukangBaik',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: 'TukangBaik – Booking Tukang Bangunan',
    description: 'Temukan dan booking tukang bangunan profesional di sekitar Anda.',
    siteName: 'TukangBaik',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)',  color: '#1d4ed8' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <GoogleProvider>
          <QueryProvider>
            <div className="app-wrapper">{children}</div>
            <PWAProvider />
          </QueryProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
