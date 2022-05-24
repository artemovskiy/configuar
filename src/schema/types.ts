export type Constructor<T = any> = new (...args: any[]) => T;

type ReplacePrimitiveConstructors<T> = T extends string
  ? Constructor<string> | StringConstructor : T extends number
    ? Constructor<number> | NumberConstructor : Constructor<T>;

export type Schema<TValue> = {
  [P in keyof TValue]: {
    ctor: ReplacePrimitiveConstructors<TValue[P]>,
  }
};
