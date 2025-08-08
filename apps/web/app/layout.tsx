import '@/app/globals.css';
import { AppProviders } from '@/providers';
import { cn, Toaster } from '@paykit-sdk/ui';
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  variable: '--font-pt-sans',
  display: 'swap',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Paykit',
  description: 'The Payment Toolkit for Typescript',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(ptSans.variable, 'font-pt-sans antialiased')}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
