import { z } from 'zod';
import { agenticAddressSchema } from './agentic-address';
import { agenticBuyerSchema } from './agentic-buyer';
import { agenticFufillmentOptionSchema } from './agentic-fufillment';
import { agenticLinkSchema, agenticMessageSchema } from './agentic-message';

export const agenticTotalsSchema = z.object({
  /**
   * The type of the totals.
   */
  type: z.enum(['items_base_amount', 'items_discount', 'subtotal', 'discount', 'fulfillment', 'tax', 'fee', 'total']),

  /**
   * The display text of the totals.
   */
  display_text: z.string(),

  /**
   * The amount of the totals.
   */
  amount: z.number(),
});

export type AgenticTotals = z.infer<typeof agenticTotalsSchema>;

export const agenticOrderSchema = z.object({
  /**
   * The ID of the order.
   */
  id: z.string(),

  /**
   * The ID of the checkout session.
   */
  checkout_session_id: z.string(),

  /**
   * The permalink URL of the order.
   */
  permalink_url: z.string(),
});

export type AgenticOrder = z.infer<typeof agenticOrderSchema>;

export const agenticCheckoutSessionStatus = z.enum(['not_ready_for_payment', 'ready_for_payment', 'completed', 'cancelled', 'in_progress']);

export const agenticCheckoutSessionSchema = z.object({
  /**
   * The ID of the checkout.
   */
  id: z.string(),

  /**
   * The buyer of the checkout.
   */
  buyer: agenticBuyerSchema,

  /**
   * The payment provider of the checkout.
   */
  payment_provider: z.object({ provider: z.string(), supported_payment_methods: z.array(z.enum(['card'])) }),

  /**
   * The status of the checkout.
   */

  status: agenticCheckoutSessionStatus,

  /**
   * The currency of the checkout.
   */
  currency: z.string(),

  /**
   * The line items of the checkout.
   */
  line_items: z.array(z.object({ id: z.string(), quantity: z.number() })),

  /**
   * The fulfillment address of the checkout.
   */
  fulfillment_address: agenticAddressSchema.optional().nullable(),

  /**
   * The fulfillment options of the checkout.
   */
  fulfillment_options: z.array(agenticFufillmentOptionSchema),

  /**
   * The fulfillment option ID of the checkout.
   */
  fulfillment_option_id: z.string().optional().nullable(),

  /**
   * The totals of the checkout.
   */
  totals: z.array(agenticTotalsSchema),

  /**
   * The messages of the checkout.
   */
  messages: z.array(agenticMessageSchema),

  /**
   * The links of the checkout.
   */
  links: z.array(agenticLinkSchema).optional().nullable(),

  /**
   * The order of the checkout.
   */
  order: agenticOrderSchema.optional().nullable(),
});

export type AgenticCheckoutSession = z.infer<typeof agenticCheckoutSessionSchema>;

export const createAgenticCheckoutSessionParamsSchema = z.object({
  /**
   * The buyer of the checkout.
   */
  buyer: agenticBuyerSchema,

  /**
   * The items of the checkout.
   */
  items: z.array(z.object({ id: z.string(), quantity: z.number() })),

  /**
   * The fulfillment address of the checkout.
   */
  fulfillment_address: agenticAddressSchema.optional().nullable(),
});

export type CreateAgenticCheckoutSessionParams = z.infer<typeof createAgenticCheckoutSessionParamsSchema>;

export const updateAgenticCheckoutSessionParamsSchema = createAgenticCheckoutSessionParamsSchema.partial();

export type UpdateAgenticCheckoutSessionParams = z.infer<typeof updateAgenticCheckoutSessionParamsSchema>;
