import { z } from 'zod';

export const $GumroadApiResponse = z.object({
  success: z.boolean(),
});

export const $GumroadApiError = z.object({
  success: z.literal(false),
  message: z.string(),
});
