export type PaykitProviderBaseConfig = {
  /**
   * Enable debug logging for development.
   * @default false
   */
  debug?: boolean;
};

export type PaykitProviderBaseWithAuthConfig<T extends object> = PaykitProviderBaseConfig & T;

export type OverrideProps<T, V> = V & Omit<T, keyof V>;

export type LooseAutoComplete<T extends string> = T | Omit<string, T>;

export type PaykitMetadata = {
  [key: string]: string;
};
