import { z } from 'zod';

export const customerAppMetadataSchema = z.object({
  providers: z.record(z.string(), z.string()),
});

export type CustomerAppMetadata = z.infer<typeof customerAppMetadataSchema>;

export const organizationMetadataSchema = z.record(z.string(), z.unknown());

export type OrganizationMetadata = z.infer<typeof organizationMetadataSchema>;

export const variablesSchema = z.object({
  organizationId: z.string(),
});

export type Variables = z.infer<typeof variablesSchema>;
