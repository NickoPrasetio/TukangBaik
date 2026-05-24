import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'TukangKu – Booking Tukang Bangunan Terpercaya',
  description: 'Temukan dan booking tukang bangunan profesional di sekitar Anda dengan mudah dan aman.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <QueryProvider>
          <div className="app-wrapper">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
