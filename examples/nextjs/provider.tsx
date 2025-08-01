'use client';

import * as React from 'react';
import { provider } from '@/lib/paykit';
import { PaykitProvider } from '@paykit-sdk/react';
import { Toaster } from '@paykit-sdk/ui';
import { ThemeProvider } from 'next-themes';

export const AppProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <PaykitProvider provider={provider}>
        <>
          {children}
          <Toaster />
        </>
      </PaykitProvider>
    </ThemeProvider>
  );
};
