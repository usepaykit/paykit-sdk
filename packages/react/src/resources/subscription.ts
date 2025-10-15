import { CreateSubscriptionSchema, Subscription, UpdateSubscriptionSchema } from '@paykit-sdk/core';
import { usePaykitContext } from '../context';
import { useAsyncFn } from '../hooks/use-async-fn';

export const useSubscription = () => {
  const ctx = usePaykitContext();

  const create = useAsyncFn<[CreateSubscriptionSchema], Subscription>('/subscription/create', ctx.apiUrl, ctx.headers);
  const update = useAsyncFn<[string, UpdateSubscriptionSchema], Subscription>('/subscription/update', ctx.apiUrl, ctx.headers);
  const retrieve = useAsyncFn<[string], Subscription | null>('/subscription/retrieve', ctx.apiUrl, ctx.headers);
  const cancel = useAsyncFn<[string], Subscription>('/subscription/cancel', ctx.apiUrl, ctx.headers);
  const remove = useAsyncFn<[string], null>('/subscription/delete', ctx.apiUrl, ctx.headers);

  return { create, update, retrieve, cancel, remove };
};
