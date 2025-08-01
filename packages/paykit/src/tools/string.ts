export const truncate = (str: string, num: number, suffix = '...') => {
  if (!str) return '';

  if (str.length < num) return str;

  return str.slice(0, num) + suffix;
};
