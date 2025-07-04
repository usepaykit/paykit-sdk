import * as React from 'react';
import { PayKitProvider as PaykitProvider$1 } from '@paykit-sdk/core';
import { QueryClient } from '@tanstack/react-query';
import { parseElementContext } from './util';

type PaykitContextValue = { provider: PaykitProvider$1; apiPath: string; queryClient?: QueryClient };

const PaykitContext = React.createContext({} as PaykitContextValue);

export const PaykitProvider = ({ provider, apiPath, queryClient, children }: React.PropsWithChildren<PaykitContextValue>) => {
  const queryClient$1 = queryClient ?? new QueryClient();

  return <PaykitContext.Provider value={{ provider, apiPath, queryClient: queryClient$1 }}>{children}</PaykitContext.Provider>;
};

export const usePaykitContext = () => parseElementContext(React.useContext(PaykitContext), 'PaykitContext');
