'use client';

import * as React from 'react';
import { provider } from '@/lib/paykit';
import { PaykitProvider } from '@paykit-sdk/react';
import { ThemeProvider } from 'next-themes';

export const AppProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <PaykitProvider provider={provider}>{children}</PaykitProvider>
    </ThemeProvider>
  );
};
