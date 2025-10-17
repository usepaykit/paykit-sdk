import { EndpointArgs, EndpointReturn } from '@paykit-sdk/core';
import { usePaykitContext } from '../context';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useCustomer = () => {
  const ctx = usePaykitContext();

  const retrieve = useAsyncFn<
    EndpointArgs<'/customer/retrieve'>,
    EndpointReturn<'/customer/retrieve'>
  >('/customer/retrieve', ctx.apiUrl, ctx.headers);

  const create = useAsyncFn<EndpointArgs<'/customer/create'>, EndpointReturn<'/customer/create'>>(
    '/customer/create',
    ctx.apiUrl,
    ctx.headers,
  );

  const update = useAsyncFn<EndpointArgs<'/customer/update'>, EndpointReturn<'/customer/update'>>(
    '/customer/update',
    ctx.apiUrl,
    ctx.headers,
  );

  const remove = useAsyncFn<EndpointArgs<'/customer/delete'>, EndpointReturn<'/customer/delete'>>(
    '/customer/delete',
    ctx.apiUrl,
    ctx.headers,
  );

  return { retrieve, create, update, remove };
};
