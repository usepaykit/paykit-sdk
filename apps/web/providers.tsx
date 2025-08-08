'use client';

import * as React from 'react';
import { Toaster } from '@paykit-sdk/ui';
import { ThemeProvider } from 'next-themes';
import { initMixpanel } from './lib/analytics';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  React.useEffect(() => {
    initMixpanel();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {children}
      <Toaster />
    </ThemeProvider>
  );
};
