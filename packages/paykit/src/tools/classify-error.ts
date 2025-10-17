import is from '@sindresorhus/is';

export function classifyError(err: unknown) {
  if (is.error(err)) {
    if (err.message.includes('429')) return 'rate_limit';
    if (['ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND'].includes(err.message.toUpperCase()))
      return 'connection';
    if (['ETIMEDOUT', 'ECONNABORTED', '23'].includes(err.message.toUpperCase()))
      return 'timeout';
    if (['401', 'UNAUTHORIZED'].includes(err.message)) return 'unauthorized';
    if (['403', 'FORBIDDEN'].includes(err.message.toUpperCase())) return 'forbidden';
    if (['404', 'NOT FOUND'].includes(err.message)) return 'not_found';
    if (['500', 'INTERNAL SERVER ERROR'].includes(err.message))
      return 'internal_server_error';
    if (['502', 'BAD_GATEWAY'].includes(err.message.toUpperCase())) return 'bad_gateway';
    if (['503', 'SERVICE UNAVAILABLE'].includes(err.message.toUpperCase()))
      return 'service_unavailable';
    if (['504', 'GATEWAY TIMEOUT'].includes(err.message.toUpperCase()))
      return 'gateway_timeout';
  }
  return 'unknown';
}
