import { z } from 'zod';
import { metadataSchema } from './metadata';

export const customerSchema = z.object({
  /**
   * The ID of the customer.
   */
  id: z.string(),

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

export type Customer = z.infer<typeof customerSchema>;

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
