'use client';

import { provider } from '@/lib/paykit';
import { PaykitProvider } from '@paykit-sdk/react';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <PaykitProvider provider={provider}>{children}</PaykitProvider>;
}
