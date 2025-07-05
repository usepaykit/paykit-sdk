import * as React from 'react';
import { PayKitProvider as PaykitProvider$1 } from '@paykit-sdk/core';
import { parseElementContext } from './util';

type PaykitContextValue = { provider: PaykitProvider$1 };

const PaykitContext = React.createContext({} as PaykitContextValue);

export const PaykitProvider = ({ provider, children }: React.PropsWithChildren<PaykitContextValue>) => {
  return <PaykitContext.Provider value={{ provider }}>{children}</PaykitContext.Provider>;
};

export const usePaykitContext = () => parseElementContext(React.useContext(PaykitContext), 'PaykitContext');
