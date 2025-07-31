import type React from 'react';
import { AppProvider } from '@/provider';
import { cn } from '@paykit-sdk/ui';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Acme Taskboard - PayKit Example',
  description: 'Example PayKit implementation for task management.',
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, outfit.variable, 'font-sans')}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
