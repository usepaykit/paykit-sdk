import { z } from 'zod';

/**
 * Shipping address for physical goods delivery
 */
export const shippingAddressSchema = z.object({
  /**
   * Full name of the recipient
   */
  name: z.string().min(1, 'Recipient name is required'),

  /**
   * Primary street address
   */
  line1: z.string().min(1, 'Address line 1 is required'),

  /**
   * Secondary address (apartment, suite, unit, etc.)
   */
  line2: z.string().optional(),

  /**
   * City
   */
  city: z.string().min(1, 'City is required'),

  /**
   * State, province, or region
   */
  state: z.string().optional(), // Optional because not all countries use states

  /**
   * Postal code or ZIP code
   */
  postal_code: z.string().min(1, 'Postal code is required'),

  /**
   * Country code (ISO 3166-1 alpha-2)
   * Examples: "US", "GB", "CA", "DE", etc.
   */
  country: z.string().length(2, 'Country must be a 2-letter ISO code').toUpperCase(),

  /**
   * Contact phone number for delivery
   */
  phone: z.string().optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

/**
 * Complete shipping information including carrier preferences
 */
export const shippingInfoSchema = z.object({
  /**
   * Shipping address
   */
  address: shippingAddressSchema,

  /**
   * Shipping carrier preference (optional)
   * Provider-specific values
   */
  carrier: z.string().optional(),

  /**
   * Currency
   */
  currency: z.string().min(1, 'Currency is required'),
});

export type ShippingInfo = z.infer<typeof shippingInfoSchema>;
