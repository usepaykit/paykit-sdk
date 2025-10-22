import { EndpointArgs, EndpointReturn, Payment } from '@paykit-sdk/core';
import { usePaykitContext } from '../context';
import { useAsyncFn } from '../hooks/use-async-fn';

export const usePayment = () => {
  const ctx = usePaykitContext();

  const create = useAsyncFn<
    EndpointArgs<'/payment/create'>,
    EndpointReturn<'/payment/create'>
  >('/payment/create', ctx.apiUrl, ctx.headers);

  const retrieve = useAsyncFn<
    EndpointArgs<'/payment/retrieve'>,
    EndpointReturn<'/payment/retrieve'>
  >('/payment/retrieve', ctx.apiUrl, ctx.headers);

  const update = useAsyncFn<
    EndpointArgs<'/payment/update'>,
    EndpointReturn<'/payment/update'>
  >('/payment/update', ctx.apiUrl, ctx.headers);

  const remove = useAsyncFn<
    EndpointArgs<'/payment/delete'>,
    EndpointReturn<'/payment/delete'>
  >('/payment/delete', ctx.apiUrl, ctx.headers);

  const capture = useAsyncFn<
    EndpointArgs<'/payment/capture'>,
    EndpointReturn<'/payment/capture'>
  >('/payment/capture', ctx.apiUrl, ctx.headers);
  
  const cancel = useAsyncFn<[string], Payment>(
    '/payment/cancel',
    ctx.apiUrl,
    ctx.headers,
  );

  return { create, retrieve, update, remove, capture, cancel };
};
