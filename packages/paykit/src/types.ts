export type WithPaymentProviderConfig<T extends object> = T & {
  apiKey: string;
  environment?: 'test' | 'live';
};

export type NonNullable<T> = T extends null | undefined
  ? never
  : T extends object
    ? {
        [P in keyof T]: NonNullable<T[P]>;
      }
    : T;
