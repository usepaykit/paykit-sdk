import { comgate } from '@paykit-sdk/comgate';
import { gopay } from '@paykit-sdk/gopay';
import { monnify } from '@paykit-sdk/monnify';
import { paypal } from '@paykit-sdk/paypal';
import { polar } from '@paykit-sdk/polar';
import { stripe } from '@paykit-sdk/stripe';
import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, jsonb, index, uuid } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';

export const providerEnum = pgEnum('provider', [
  stripe().providerName,
  gopay().providerName,
  monnify().providerName,
  paypal().providerName,
  polar().providerName,
  comgate().providerName,
]);

export const customers = pgTable(
  'paykit_customers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    apiKey: text('api_key').notNull(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    phone: text('phone'),
    metadata: jsonb('metadata'),
    provider: providerEnum('provider').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    // Composite index for fast lookups by API key + email + provider
    apiKeyEmailProviderIdx: index('idx_api_key_email_provider').on(
      table.apiKey,
      table.email,
      table.provider,
    ),
    // Index for API key queries
    apiKeyIdx: index('idx_api_key').on(table.apiKey),

    // Unique constraint per API key + provider + email
    uniqueCustomer: index('idx_unique_customer').on(
      table.apiKey,
      table.provider,
      table.email,
    ),
  }),
);

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    apiKey: text('api_key').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at')
      .notNull()
      .default(sql`now() + interval '1 year'`),
  },
  table => ({
    userIdIdx: index('idx_user_id').on(table.userId),
  }),
);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
