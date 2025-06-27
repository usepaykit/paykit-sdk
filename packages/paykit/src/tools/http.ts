/**
 * Inspired by @polar-sh/sdk
 * https://github.com/polarsource
 */

export function isConnectionError(err: unknown): boolean {
  if (typeof err !== 'object' || err == null) {
    return false;
  }

  // Covers fetch in Deno as well
  const isBrowserErr = err instanceof TypeError && err.message.toLowerCase().startsWith('failed to fetch');

  const isNodeErr = err instanceof TypeError && err.message.toLowerCase().startsWith('fetch failed');

  const isBunErr = 'name' in err && err.name === 'ConnectionError';

  const isGenericErr = 'code' in err && typeof err.code === 'string' && err.code.toLowerCase() === 'econnreset';

  return isBrowserErr || isNodeErr || isGenericErr || isBunErr;
}

/**
 * Uses various heurisitics to determine if an error is a timeout error.
 */
export function isTimeoutError(err: unknown): boolean {
  if (typeof err !== 'object' || err == null) {
    return false;
  }

  // Fetch in browser, Node.js, Bun, Deno
  const isNative = 'name' in err && err.name === 'TimeoutError';
  const isLegacyNative = 'code' in err && err.code === 23;

  // Node.js HTTP client and Axios
  const isGenericErr = 'code' in err && typeof err.code === 'string' && err.code.toLowerCase() === 'econnaborted';

  return isNative || isLegacyNative || isGenericErr;
}

/**
 * Uses various heurisitics to determine if an error is a abort error.
 */
export function isAbortError(err: unknown): boolean {
  if (typeof err !== 'object' || err == null) {
    return false;
  }

  // Fetch in browser, Node.js, Bun, Deno
  const isNative = 'name' in err && err.name === 'AbortError';
  const isLegacyNative = 'code' in err && err.code === 20;

  // Node.js HTTP client and Axios
  const isGenericErr = 'code' in err && typeof err.code === 'string' && err.code.toLowerCase() === 'econnaborted';

  return isNative || isLegacyNative || isGenericErr;
}

export function isUnauthorizedError(err: unknown): boolean {
  if (typeof err !== 'object' || err == null) {
    return false;
  }

  return err instanceof Error && err.message.toLowerCase().includes('unauthorized');
}
