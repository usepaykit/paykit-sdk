import { EndpointArgs, EndpointReturn } from '@paykit-sdk/core';
import { usePaykitContext } from '../context';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useCheckout = () => {
  const ctx = usePaykitContext();

  const create = useAsyncFn<
    EndpointArgs<'/checkout/create'>,
    EndpointReturn<'/checkout/create'>
  >('/checkout/create', ctx.apiUrl, ctx.headers);

  const retrieve = useAsyncFn<
    EndpointArgs<'/checkout/retrieve'>,
    EndpointReturn<'/checkout/retrieve'>
  >('/checkout/retrieve', ctx.apiUrl, ctx.headers);

  const update = useAsyncFn<
    EndpointArgs<'/checkout/update'>,
    EndpointReturn<'/checkout/update'>
  >('/checkout/update', ctx.apiUrl, ctx.headers);

  const remove = useAsyncFn<
    EndpointArgs<'/checkout/delete'>,
    EndpointReturn<'/checkout/delete'>
  >('/checkout/delete', ctx.apiUrl, ctx.headers);

  return { create, retrieve, update, remove };
};
