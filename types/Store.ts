type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type UseNullStore = ReturnType<typeof defineStore>;
type NullStore = ReturnType<UseNullStore>;

/**
 * StoreState<T> will include all properties from T except for the functions and the properties common to all stores.
 */
export type StoreState<T extends (...args: any) => any, T2 = Omit<ReturnType<T>, keyof NullStore>> = Pick<
  T2,
  NonFunctionPropertyNames<T2>
>;
