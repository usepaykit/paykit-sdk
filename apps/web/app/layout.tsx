import { arizoniaFont } from '@/fonts/arizonia';
import { interFont } from '@/fonts/inter';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Paykit',
  description: 'The Payment Toolkit for Typescript',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(arizoniaFont.variable, interFont.variable, 'antialiased')}>
        {children}
      </body>
    </html>
  );
}
