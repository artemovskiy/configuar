// eslint-disable-next-line import/prefer-default-export
export const exclude = <T>(set: T[], excludedItems: T[]) => {
  const excludeSet = new Set(excludedItems);
  return set.filter((i) => !excludeSet.has(i));
};
