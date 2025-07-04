import * as React from 'react';
import { PayKitProvider as PaykitProvider$1 } from '@paykit-sdk/core';
import { QueryClient } from '@tanstack/react-query';
import { parseElementContext } from './util';

type PaykitContextValue = { provider: PaykitProvider$1; queryClient?: QueryClient };

const PaykitContext = React.createContext({} as PaykitContextValue);

export const PaykitProvider = ({ provider, queryClient, children }: React.PropsWithChildren<PaykitContextValue>) => {
  const queryClient$1 = queryClient ?? new QueryClient();

  return <PaykitContext.Provider value={{ provider, queryClient: queryClient$1 }}>{children}</PaykitContext.Provider>;
};

export const usePaykitContext = () => parseElementContext(React.useContext(PaykitContext), 'PaykitContext');
