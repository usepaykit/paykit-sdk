import type { BillingInfo } from '@paykit-sdk/core';
import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
  uuid,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';
import { type CustomerAppMetadata, type OrganizationMetadata } from '../schema.js';

export const organizationRoleEnum = pgEnum('organization_role', [
  'owner', // Full access, can manage members and API keys
  'admin', // Can manage most things except billing/owner
  'member', // Standard access
  'viewer', // Read-only access
]);

export const organizationMemberStatusEnum = pgEnum('organization_member_status', [
  'active',
  'invited',
  'rejected',
  'revoked',
]);

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    emailIdx: index('idx_account_email').on(table.email),
  }),
);

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(), // URL-friendly identifier
    metadata: jsonb('metadata').$type<OrganizationMetadata>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    slugIdx: index('idx_org_slug').on(table.slug),
  }),
);

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: uuid('account_id')
      .references(() => accounts.id, { onDelete: 'cascade' })
      .notNull(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    role: organizationRoleEnum('role').notNull(),
    status: organizationMemberStatusEnum('status').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    // Unique constraint: one account can only have one role per organization
    uniqueAccountOrg: index('idx_unique_account_org').on(
      table.accountId,
      table.organizationId,
    ),
    accountIdIdx: index('idx_org_member_account').on(table.accountId),
    organizationIdIdx: index('idx_org_member_org').on(table.organizationId),
  }),
);

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    secret: text('secret').notNull().unique(),
    name: text('name').notNull(),
    lastUsedAt: timestamp('last_used_at'),
    expiresAt: timestamp('expires_at')
      .notNull()
      .default(sql`now() + interval '1 year'`),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    organizationIdIdx: index('idx_api_key_org').on(table.organizationId),
    apiKeyIdx: index('idx_api_key').on(table.id, table.secret),
  }),
);

export const customers = pgTable(
  'customers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    phone: text('phone'),
    appMetadata: jsonb('app_metadata').default({}).$type<CustomerAppMetadata>(),
    metadata: jsonb('metadata'),
    billing: jsonb('billing').$type<BillingInfo>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    emailIdx: index('idx_customer_email').on(table.email),
    uniqueCustomer: index('idx_unique_customer').on(table.organizationId, table.email),
    organizationIdIdx: index('idx_customer_org').on(table.organizationId),
  }),
);

export type ApiKey = typeof apiKeys.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
