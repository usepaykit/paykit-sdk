import * as React from 'react';

interface PaykitProviderProps extends React.PropsWithChildren {
  apiUrl: string;
  headers?: Record<string, string> | (() => Record<string, string>);
}

const PaykitContext = React.createContext<PaykitProviderProps | undefined>(undefined);

export const PaykitProvider = ({ apiUrl, headers, children }: PaykitProviderProps) => {
  const value = React.useMemo(() => ({ apiUrl, headers }), [apiUrl, headers]);

  return <PaykitContext.Provider value={value}>{children}</PaykitContext.Provider>;
};

export const usePaykitContext = () => {
  const ctx = React.useContext(PaykitContext);

  if (!ctx)
    throw new Error('Your app must be wrapped in PayKitProvider to use PayKit hooks.');

  return ctx;
};
