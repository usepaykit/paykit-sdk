import { z } from 'zod';

export const agenticMessageSchema = z.object({
  /**
   * The type of the message.
   */
  type: z.enum(['info', 'error']),

  /**
   * The code of the message.
   */
  code: z
    .enum(['missing', 'invalid', 'out_of_stock', 'payment_declined', 'requires_sign_in', 'requires_3ds'])
    .optional(),

  /**
   * The param of the message.
   */
  param: z.string().optional(),

  /**
   * The content type of the message.
   */
  content_type: z.enum(['plain', 'markdown']),

  /**
   * The content of the message.
   */
  content: z.string(),
});

export type AgenticMessage = z.infer<typeof agenticMessageSchema>;

export const agenticLinkSchema = z.object({
  /**
   * The type of the link.
   */
  type: z.enum(['terms_of_use', 'privacy_policy', 'seller_shop_policies']),

  /**
   * The URL of the link.
   */
  url: z.string(),
});

export type AgenticLink = z.infer<typeof agenticLinkSchema>;
