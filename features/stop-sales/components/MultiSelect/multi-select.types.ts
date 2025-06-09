export type MultiSelectOption<T> = {
  label: string;
  val: T;
} & {
  [key: string]: any;
};
