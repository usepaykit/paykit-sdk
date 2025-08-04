import { z } from 'zod';
import { metadataSchema, PaykitMetadata } from './metadata';

export interface Customer {
  /**
   * The ID of the customer.
   */
  id: string;
  /**
   * The email of the customer.
   */
  email?: string;
  /**
   * The name of the customer.
   */
  name?: string;
  /**
   * The metadata of the customer.
   */
  metadata?: PaykitMetadata;
}

export const createCustomerSchema = z.object({
  /**
   * The email of the customer.
   */
  email: z.string().email(),

  /**
   * The name of the customer.
   */
  name: z.string().optional(),

  /**
   * The metadata of the customer.
   */
  metadata: metadataSchema.optional(),
});

export type CreateCustomerParams = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = z.object({
  /**
   * The email of the customer.
   */
  email: z.string().email().optional(),

  /**
   * The name of the customer.
   */
  name: z.string().optional(),

  /**
   * The metadata of the customer.
   */
  metadata: metadataSchema.optional(),
});

export type UpdateCustomerParams = z.infer<typeof updateCustomerSchema>;

export const retrieveCustomerSchema = z.object({
  id: z.string(),
});

export type RetrieveCustomerParams = z.infer<typeof retrieveCustomerSchema>;
