export interface Parser<T> {
  parse(value: string): T;
}
