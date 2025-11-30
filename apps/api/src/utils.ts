import type { ApiKey } from './db/schema.js';

export const apiKeyToString = (apiRecord: Pick<ApiKey, 'id' | 'secret'>) => {
  return Buffer.from(`${apiRecord.id}-${apiRecord.secret}`).toString('base64');
};

export const apiKeyFromString = (apiKey: string) => {
  const decoded = Buffer.from(apiKey, 'base64').toString();
  const [id, secret] = decoded.split('-');
  return { id, secret } as Pick<ApiKey, 'id' | 'secret'>;
};
