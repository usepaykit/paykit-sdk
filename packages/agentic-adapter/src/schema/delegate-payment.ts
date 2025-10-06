import { z } from 'zod';

export const delegatePaymentParamsSchema = z.unknown();

export type DelegatePaymentParams = z.infer<typeof delegatePaymentParamsSchema>;

export const delegatePaymentResponseSchema = z.unknown();

export type DelegatePaymentResponse = z.infer<typeof delegatePaymentResponseSchema>;
