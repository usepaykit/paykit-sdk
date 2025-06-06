export type WithPaymentProviderConfig<T extends object> = T & {
  apiKey: string;
  environment?: 'test' | 'live';
};

export type OverrideProps<T, V> = V & Omit<T, keyof V>;

export type LooseAutoComplete<T extends string> = T | Omit<string, T>;

export type StringMetadata = {
  [key: string]: string;
};
