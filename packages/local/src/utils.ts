import { tryCatchSync } from '@paykit-sdk/core';

/**
 * Removes all non digits characters
 * Limits to 16 digits;
 * Adds spaces after every 4 digits;
 */
export const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

/**
 * Parse values that start with `$json` prefix as JSON from an object
 */
export const parseJsonValues = (obj: Record<string, any>) => {
  const result = {} as Record<string, any>;
  const jsonPrefix = '$json';

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.startsWith(jsonPrefix)) {
      const [data, error] = tryCatchSync(() => JSON.parse(value.slice(jsonPrefix.length)));
      if (error) result[key] = value;
      else result[key] = data;
    } else {
      result[key] = value;
    }
  }

  return result;
};
