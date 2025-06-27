export const extractPolarHeaders = (headers: Record<string, string | string[]>): Record<string, string> => {
  const polarHeaders: Record<string, string> = {};

  // Polar-specific header keys
  const requiredHeaders = ['webhook-id', 'webhook-timestamp', 'webhook-signature'];

  for (const key of requiredHeaders) {
    const value = headers[key] || headers[key.toLowerCase()];
    if (value) {
      polarHeaders[key] = Array.isArray(value) ? value[0] : value;
    }
  }

  return polarHeaders;
};
