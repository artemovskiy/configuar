export const exclude = <T>(set: T[], exclude: T[]) => {
  const excludeSet = new Set(exclude);
  return set.filter((i) => !excludeSet.has(i));
};
