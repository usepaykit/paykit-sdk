# PayKit Registry Usage Guide

Complete guide to using the PayKit registry with shadcn CLI.

## Table of Contents

- [Quick Start](#quick-start)
- [Namespace Configuration](#namespace-configuration)
- [Installation Methods](#installation-methods)
- [Viewing Resources](#viewing-resources)
- [Available Integrations](#available-integrations)
- [Advanced Usage](#advanced-usage)
- [Environment Variables](#environment-variables)

## Quick Start

The fastest way to get started is using direct URLs:

```bash
npx shadcn@latest add https://usepaykit.dev/r/stripe-nextjs
```

This installs:

- PayKit configuration file (`lib/paykit.ts`)
- API routes for payment operations
- Webhook handler route
- TypeScript types

## Namespace Configuration

For a better developer experience, configure the `@paykit` namespace once:

### Step 1: Add to components.json

```json
{
  "registries": {
    "@paykit": "https://usepaykit.dev/r/{name}"
  }
}
```

### Step 2: Install integrations

```bash
npx shadcn@latest add @paykit/stripe-nextjs
npx shadcn@latest add @paykit/stripe-hono
```

### Full Example components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "lib": "@/lib"
  },
  "registries": {
    "@paykit": "https://usepaykit.dev/r/{name}"
  }
}
```

## Installation Methods

### Method 1: Direct URL

```bash
npx shadcn@latest add https://usepaykit.dev/r/stripe-nextjs
```

**Pros:**

- No configuration needed
- Works immediately
- Good for trying out integrations

**Cons:**

- Verbose commands
- Harder to remember

### Method 2: Namespace (Recommended)

```bash
# Configure once
# Add "@paykit": "https://usepaykit.dev/r/{name}" to components.json

# Then use clean syntax
npx shadcn@latest add @paykit/stripe-nextjs
```

**Pros:**

- Clean, memorable syntax
- Faster to type
- Feels like installing npm packages

**Cons:**

- Requires initial configuration

### Method 3: Multiple at Once

```bash
npx shadcn@latest add @paykit/stripe-nextjs @paykit/stripe-hono-drizzle
```

Installs multiple integrations in one command.

## Viewing Resources

Inspect what will be installed before adding:

```bash
# View a specific integration
npx shadcn@latest view https://usepaykit.dev/r/stripe-nextjs

# Or with namespace
npx shadcn@latest view @paykit/stripe-nextjs
```

This shows:

- Files that will be created
- Dependencies that will be installed
- Required environment variables
- Configuration details

## Available Integrations

### Next.js Integrations

| Integration                    | Description                   | ORM    |
| ------------------------------ | ----------------------------- | ------ |
| `@paykit/stripe-nextjs`        | Stripe for Next.js App Router | None   |
| `@paykit/stripe-nextjs-prisma` | Stripe with Prisma models     | Prisma |
| `@paykit/paypal-nextjs`        | PayPal for Next.js App Router | None   |
| `@paykit/paypal-nextjs-prisma` | PayPal with Prisma models     | Prisma |

### Hono Integrations

| Integration                   | Description                 | ORM     |
| ----------------------------- | --------------------------- | ------- |
| `@paykit/stripe-hono`         | Stripe for Hono backend     | None    |
| `@paykit/stripe-hono-drizzle` | Stripe with Drizzle schemas | Drizzle |

### Discovery

List all available integrations:

```bash
curl https://usepaykit.dev/r
```

Or view individual integration:

```bash
curl https://usepaykit.dev/r/stripe-nextjs
```

## Advanced Usage

### Installing with Dependencies

Some integrations depend on others. For example, `stripe-hono-drizzle` depends on `stripe-hono`:

```bash
npx shadcn@latest add @paykit/stripe-hono-drizzle
```

This automatically installs:

1. `stripe-hono` (base integration)
2. `stripe-hono-drizzle` (adds Drizzle schemas)

### Overwriting Existing Files

Use `--overwrite` to replace existing files:

```bash
npx shadcn@latest add @paykit/stripe-nextjs --overwrite
```

### Different Project Structures

The registry adapts to your project structure based on `components.json`:

```json
{
  "aliases": {
    "lib": "@/lib", // PayKit config goes to lib/paykit.ts
    "utils": "@/utils" // Alternative: utils/paykit.ts
  }
}
```

## Environment Variables

After installation, set required environment variables:

### Stripe

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Get these from:

- API Keys: https://dashboard.stripe.com/apikeys
- Webhooks: https://dashboard.stripe.com/webhooks

### PayPal

```bash
# .env.local
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_SANDBOX=true
PAYPAL_WEBHOOK_ID=your_webhook_id
```

Get these from:

- Apps: https://developer.paypal.com/dashboard/applications
- Webhooks: https://developer.paypal.com/dashboard/webhooks

Set `PAYPAL_SANDBOX=false` for production.

## Next Steps

After installation:

1. **Install dependencies** - The CLI prompts you to install required packages
2. **Set environment variables** - Add the required env vars to `.env.local`
3. **Configure webhooks** - Set up webhook endpoints in your payment provider
4. **Test the integration** - Make a test payment using the PayKit SDK

## Examples

### Full Next.js Setup

```bash
# 1. Initialize shadcn (if not already)
npx shadcn@latest init

# 2. Add PayKit registry to components.json
# Add: "@paykit": "https://usepaykit.dev/r/{name}"

# 3. Install Stripe integration
npx shadcn@latest add @paykit/stripe-nextjs

# 4. Install dependencies (prompted by CLI)
npm install @paykit-sdk/core @paykit-sdk/stripe

# 5. Add environment variables
echo "STRIPE_SECRET_KEY=sk_test_..." >> .env.local
echo "STRIPE_WEBHOOK_SECRET=whsec_..." >> .env.local

# 6. Start dev server
npm run dev

# 7. Test endpoints
curl http://localhost:3000/api/paykit/customer/create
```

### Full Hono Setup with Drizzle

```bash
# 1. Configure registry
# Add: "@paykit": "https://usepaykit.dev/r/{name}"

# 2. Install integration
npx shadcn@latest add @paykit/stripe-hono-drizzle

# 3. Install dependencies
npm install @paykit-sdk/core @paykit-sdk/stripe hono drizzle-orm

# 4. Set up environment
echo "STRIPE_SECRET_KEY=sk_test_..." >> .env

# 5. Push database schema
npx drizzle-kit push

# 6. Start server
npm run dev
```

## Troubleshooting

### Registry not found

```
Error: Unknown registry "@paykit"
```

**Solution:** Add the registry to `components.json`:

```json
{
  "registries": {
    "@paykit": "https://usepaykit.dev/r/{name}"
  }
}
```

### Integration not found

```
Error: The item at https://usepaykit.dev/r/unknown was not found
```

**Solution:** Check available integrations:

```bash
curl https://usepaykit.dev/r
```

### File already exists

```
Warning: File lib/paykit.ts already exists
```

**Solution:** Use `--overwrite` flag:

```bash
npx shadcn@latest add @paykit/stripe-nextjs --overwrite
```

## API Reference

### Registry Endpoints

| Endpoint            | Description              |
| ------------------- | ------------------------ |
| `GET /r`            | List all integrations    |
| `GET /r/{name}`     | Get specific integration |
| `OPTIONS /r/{name}` | Get integration metadata |

### Integration Types

- `registry:lib` - Library/utility files
- `registry:page` - API routes or pages
- `registry:file` - Configuration files (Prisma schemas, etc.)

## Support

- [Documentation](https://usepaykit.dev)
- [GitHub Issues](https://github.com/usepaykit/paykit-sdk/issues)
- [Discord Community](https://discord.gg/paykit)
