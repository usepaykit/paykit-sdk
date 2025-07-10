import { cn } from '@paykit-sdk/ui';
import '@paykit-sdk/ui/dist/output.css';
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';

const ptSans = PT_Sans({
  subsets: ['latin'],
  variable: '--font-pt-sans',
  display: 'swap',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Local Provider | PayKit',
  description: 'PayKit Local Provider Development Environment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(ptSans.variable, 'font-pt-sans antialiased')}>{children}</body>
    </html>
  );
}
