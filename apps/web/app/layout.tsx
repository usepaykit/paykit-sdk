import { ThemeProvider } from '@/components/theme-provider';
import { arizoniaFont } from '@/fonts/arizonia';
import { interFont } from '@/fonts/inter';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Paykit',
  description: 'The Payment Toolkit for Typescript',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(arizoniaFont.variable, interFont.variable, 'antialiased')}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
