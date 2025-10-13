import { z } from 'zod';
import { schema } from '../tools';

export interface ShippingAddress {
  /**
   * Full name of the recipient
   */
  name: string;

  /**
   * Primary street address
   */
  line1: string;

  /**
   * Secondary address (apartment, suite, unit, etc.)
   */
  line2?: string;

  /**
   * City
   */
  city: string;

  /**
   * State, province, or region
   */
  state?: string;

  /**
   * Postal code or ZIP code
   */
  postal_code: string;

  /**
   * Country code (ISO 3166-1 alpha-2)
   * Examples: "US", "GB", "CA", "DE", etc.
   */
  country: string;

  /**
   * Contact phone number for delivery
   */
  phone?: string;
}

/**
 * Shipping address for physical goods delivery
 */
export const shippingAddressSchema = schema<ShippingAddress>()(
  z.object({
    name: z.string().min(1, 'Recipient name is required'),
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(), // Optional because not all countries use states
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().length(2, 'Country must be a 2-letter ISO code').toUpperCase(),
    phone: z.string().optional(),
  }),
);

export interface ShippingInfo {
  /**
   * Shipping address
   */
  address: ShippingAddress;

  /**
   * Shipping carrier preference (optional)
   * Provider-specific values
   */
  carrier?: string;

  /**
   * Currency
   */
  currency: string;
}

/**
 * Complete shipping information including carrier preferences
 */
export const shippingInfoSchema = schema<ShippingInfo>()(
  z.object({
    address: shippingAddressSchema,
    carrier: z.string().optional(),
    currency: z.string().min(1, 'Currency is required'),
  }),
);
