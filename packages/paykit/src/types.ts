export type PaykitProviderOptions<T extends object = {}> = {
  /**
   * Whether to enable debug mode
   */
  debug?: boolean;

  /**
   * Whether to use the sandbox environment
   */
  isSandbox: boolean;

  /**
   * The API key for the PayKit Cloud API
   */
  cloudApiKey?: string;
} & T;

export type OverrideProps<T, V> = V & Omit<T, keyof V>;

export type LooseAutoComplete<T extends string> = T | Omit<string, T>;
