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
 * Convert all query parameters to params object
 * Parse values that start with `$json` prefix as JSON
 */
export const extractParams = (url: URL) => {
  const params = {} as any;

  const jsonPrefix = '$json';

  for (const [key, value] of url.searchParams.entries()) {
    if (value.startsWith(jsonPrefix)) {
      const [data, error] = tryCatchSync(() => JSON.parse(value.slice(jsonPrefix.length)));
      if (error) params[key] = value;
      else params[key] = data;
    } else {
      params[key] = value;
    }
  }

  return params;
};
