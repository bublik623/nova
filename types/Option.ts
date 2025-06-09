export interface Option {
  label: string;
  value: string;
  [key: string]: unknown;
}

export type BaseOption<V = any> = {
  label: string;
  value: V;
  disabled?: boolean;
};

export type ListOption<T = BaseOption> = T;
