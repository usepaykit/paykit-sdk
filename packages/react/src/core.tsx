import * as React from 'react';
import { PayKitProvider as PaykitProvider$1 } from '@paykit-sdk/core';
import { parseElementContext } from './util';

const PaykitContext = React.createContext({} as { provider: PaykitProvider$1 });

interface PaykitProviderProps {
  children: React.ReactNode;
  provider: PaykitProvider$1;
}

export const PaykitProvider = ({ provider, children }: PaykitProviderProps) => {
  return <PaykitContext.Provider value={{ provider }}>{children}</PaykitContext.Provider>;
};

export const usePaykitContext = () => parseElementContext(React.useContext(PaykitContext), 'PaykitContext');
