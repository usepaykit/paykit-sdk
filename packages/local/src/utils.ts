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
 * If `resource` is present, it will be removed from the params object as it is used to determine the resource type
 * Convert all query parameters to params object
 * Parse values that start with $t prefix as JSON, remove $t prefix
 * Fallback to string if JSON parsing fails
 */
export const extractParams = (url: URL) => {
  const params = {} as any;

  for (const [key, value] of url.searchParams.entries()) {
    if (key === 'resource') continue;

    if (value.startsWith('$t')) {
      const [data, error] = tryCatchSync(() => JSON.parse(value.slice(2)));
      if (error) params[key] = value;
      else params[key] = data;
    } else {
      params[key] = value;
    }
  }

  return params;
};
