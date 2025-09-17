import '@/app/globals.css';
import { AppProviders } from '@/providers';
import { cn } from '@paykit-sdk/ui';
import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope ',
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
      <body className={cn(manrope.variable, 'font-manropema antialiased')}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
