export const pick = (keys: string[], object: Record<string, any>) => {
  const picked = {};
  for (const key of keys) {
    if (key in object) {
      picked[key] = object[key];
    }
  }
  return picked;
};

export const mapObjIndexed = <T, TResult, TKey extends string>(
  mapper: (value: T, key: TKey) => TResult,
  obj: Record<TKey, T>,
): Record<TKey, TResult> => {
  const result: Record<TKey, TResult> = {} as Record<TKey, TResult>;
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }
    result[key] = mapper(obj[key], key);
  }
  return result;
};
