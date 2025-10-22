'use client';

import * as React from 'react';
import { PaykitProvider } from '@paykit-sdk/react';

export const PaykitWrapper = ({ children }: React.PropsWithChildren) => {
  return (
    <PaykitProvider
      headers={() => ({
        'x-auth-token': '1234567890', // TODO: replace with actual token or remove if your paykit routes are public
      })}
      apiUrl="/api/paykit"
    >
      {children}
    </PaykitProvider>
  );
};
