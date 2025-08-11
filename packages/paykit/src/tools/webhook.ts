export const headersExtractor = <T extends readonly string[]>(
  headers: Record<string, string | string[]>,
  requiredHeaders: T,
): Array<{ key: T[number]; value: string | string[] }> => {
  const extractedHeaders: Array<{ key: T[number]; value: string | string[] }> = [];

  for (const key of requiredHeaders) {
    const value = headers[key] || headers[key.toLowerCase()];
    if (value) {
      extractedHeaders.push({ key, value: Array.isArray(value) ? value : [value] });
    }
  }

  return extractedHeaders;
};
