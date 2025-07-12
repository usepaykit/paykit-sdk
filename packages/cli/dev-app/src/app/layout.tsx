import { Toaster } from '@paykit-sdk/ui';
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import { ThemeProvider } from '../components/theme-provider';
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${ptSans.variable} font-pt-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
