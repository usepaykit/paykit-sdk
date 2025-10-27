'use client';

import * as React from 'react';
import { PaykitProvider } from '@paykit-sdk/react';

export const PaykitWrapper = ({ children }: React.PropsWithChildren) => {
  return (
    <PaykitProvider headers={{ xApiKey: '1234567890' }} apiUrl="/api/paykit">
      {children}
    </PaykitProvider>
  );
};
