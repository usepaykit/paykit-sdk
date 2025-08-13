import { z } from 'zod';

export const PAYKIT_INTERNAL_PREFIX = '_$pk';

export const internalMetadataSchema = z.object({
  [PAYKIT_INTERNAL_PREFIX]: z.object({
    /**
     * The version of the metadata.
     */
    v: z.number().default(1),

    /**
     * The lookup table.
     */
    lookup: z.record(z.string(), z.string()).default({}),

    /**
     * The reference table.
     */
    ref: z.record(z.string(), z.string()).default({}),
  }),
});

export type InternalMetadata = z.infer<typeof internalMetadataSchema>;

export const withoutPaykitMetadata = (metadata: Record<string, any>) => {
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => key.startsWith(PAYKIT_INTERNAL_PREFIX)));
};

export const withPaykitMetadata = (metadata: Record<string, any>) => {
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !key.startsWith(PAYKIT_INTERNAL_PREFIX)));
};

/**
 * @subscriptionCreated adds __$pk { v:1, seq: 0 }
 * @invoiceStatusChanged if missing sub.metadata.__$pk, adds __$pk { v:1, seq: 0 }
 */
