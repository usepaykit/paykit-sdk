'use client';

import * as React from 'react';
import { PaykitProvider } from '@paykit-sdk/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { provider } from './lib/paykit';

const queryClient = new QueryClient();

export const AppProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        {/* @ts-expect-error - PaykitProvider children is wrongly typed bc of the different versions of react */}
        <PaykitProvider provider={provider}>{children}</PaykitProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
