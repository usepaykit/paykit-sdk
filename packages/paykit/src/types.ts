export type PaykitProviderOptions<T extends object = {}> = { debug?: boolean } & T;

export type OverrideProps<T, V> = V & Omit<T, keyof V>;

export type LooseAutoComplete<T extends string> = T | Omit<string, T>;

export type ParamsOrFactory<T> = T | ((params: T) => Promise<T>);
