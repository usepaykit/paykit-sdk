export const validateEnvVars = <K extends string>(requiredKeys: readonly K[], source: Record<string, string | undefined>): Record<K, string> => {
  const missingKeys: K[] = [];
  const result: Partial<Record<K, string>> = {};

  for (const key of requiredKeys) {
    const value = source[key];
    if (!value) {
      missingKeys.push(key);
    } else {
      result[key] = value;
    }
  }

  if (missingKeys.length > 0) {
    const missingKeysList = missingKeys.join(', ');
    throw new Error(`Missing required environment variables: ${missingKeysList}`);
  }

  return result as Record<K, string>;
};
