export const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

export const parseJsonValues = (obj: Record<string, unknown>) => {
  const result = {} as Record<string, any>;

  for (const [key, value] of Object.entries(obj)) {
    result[key] = value;
  }

  return result;
};
