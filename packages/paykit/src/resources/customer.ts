import { z } from 'zod';
import { schema } from '../tools';
import { OverrideProps } from '../types';
import { metadataSchema } from './metadata';

export interface Customer {
  /**
   * The unique identifier of the customer.
   */
  id: string;

  /**
   * The email of the customer.
   */
  email: string;

  /**
   * The name of the customer.
   */
  name: string;

  /**
   * The phone number of the customer.
   */
  phone: string;

  /**
   * The metadata of the customer.
   */
  metadata?: Record<string, string>;
}

export const customerSchema = schema<Customer>()(
  z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    phone: z.string(),
    metadata: metadataSchema.optional(),
  }),
);

type CustomerIdPayee = Customer['id'];

type EmailPayee = Pick<Customer, 'email'>;

export type Payee = CustomerIdPayee | EmailPayee;

export const payeeSchema = schema<Payee>()(
  z.union([z.string(), customerSchema.pick({ email: true })]),
);

export interface CreateCustomerParams
  extends OverrideProps<Omit<Customer, 'id'>, { name?: string }> {}

export const createCustomerSchema = schema<CreateCustomerParams>()(
  z.object({
    email: z.string().email(),
    name: z.string().optional(),
    phone: z.string(),
    metadata: metadataSchema.optional(),
  }),
);

export interface UpdateCustomerParams extends Partial<Omit<Customer, 'id'>> {
  provider_metadata?: Record<string, unknown>;
}

export const updateCustomerSchema = schema<UpdateCustomerParams>()(
  z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
    metadata: metadataSchema.optional(),
    provider_metadata: z.record(z.string(), z.unknown()).optional(),
  }),
);

export interface RetrieveCustomerParams {
  /**
   * The unique identifier of the customer.
   */
  id: string;
}

export const retrieveCustomerSchema = schema<RetrieveCustomerParams>()(
  z.object({
    id: z.string(),
  }),
);
