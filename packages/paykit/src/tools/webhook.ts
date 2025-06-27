export const headersExtractor = (
  headers: Record<string, string | string[]>,
  requiredHeaders: string[],
): Array<{ key: string; value: string | string[] }> => {
  const extractedHeaders: Array<{ key: string; value: string | string[] }> = [];

  for (const key of requiredHeaders) {
    const value = headers[key] || headers[key.toLowerCase()];
    if (value) {
      extractedHeaders.push({ key, value: Array.isArray(value) ? value : [value] });
    }
  }

  return extractedHeaders;
};
