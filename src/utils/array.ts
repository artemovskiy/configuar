export const equals = <T>(a: T[], b: T[]) =>
    a.length === b.length && a.reduce((acc, value, index) => acc && value === b[index], true);

export const exclude = <T>(set: T[], exclude: T[]) => {
    const excludeSet = new Set(exclude);
    return set.filter(i => !excludeSet.has(i));
}