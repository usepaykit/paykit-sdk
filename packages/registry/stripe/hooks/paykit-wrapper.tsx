import * as React from 'react';
import { PaykitProvider } from '@paykit-sdk/react';

export const PaykitWrapper = ({ children }: React.PropsWithChildren) => {
  return (
    <PaykitProvider apiUrl="/api/paykit" headers={{}}>
      {children}
    </PaykitProvider>
  );
};
