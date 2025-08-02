export const truncate = (str: string, num: number, suffix = '...') => {
  if (!str) return '';

  if (str.length < num) return str;

  return str.slice(0, num) + suffix;
};

export const stringifyObjectValues = (obj: Record<string, any>) => {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, JSON.stringify(value)]));
};
