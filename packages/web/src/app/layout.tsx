import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '../lib/errors/ErrorBoundary';
import { AuthProvider } from '../lib/auth/AuthContext';
import { ReduxProvider } from '@/lib/redux/Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CropSchool - Educational Gaming Platform',
  description:
    'Interactive educational games that make learning fun and engaging for children',
  keywords: ['education', 'games', 'children', 'learning', 'interactive'],
  authors: [{ name: 'CropSchool Team' }],
  creator: 'CropSchool',
  publisher: 'CropSchool',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ErrorBoundary>
            <ReduxProvider>{children}</ReduxProvider>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
