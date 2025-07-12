import { AppProvider } from '@/provider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Acme | PayKit',
  description: 'Simple, powerful analytics dashboard for your payment data. Track customers, subscriptions, and checkouts in real-time.',
  keywords: ['analytics', 'payments', 'dashboard', 'saas', 'stripe', 'subscriptions'],
  authors: [{ name: 'PayKit Team' }],
  creator: 'PayKit',
  metadataBase: new URL('https://paykit.dev'),
  openGraph: {
    title: 'PayKit Analytics - Modern Payment Dashboard',
    description: 'Simple, powerful analytics dashboard for your payment data',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PayKit Analytics',
    description: 'Modern payment analytics dashboard',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
