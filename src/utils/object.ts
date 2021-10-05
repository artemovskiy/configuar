export const pick = (keys: string[], object: Record<string, any>) => {
  const picked = {};
  for (const key of keys) {
    picked[key] = object[key];
  }
  return picked;
};
