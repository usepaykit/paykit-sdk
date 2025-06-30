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
