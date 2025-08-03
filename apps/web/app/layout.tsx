import '@/app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(ptSans.variable, 'font-pt-sans antialiased')}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
