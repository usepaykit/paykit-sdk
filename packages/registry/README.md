# PayKit Registry

Official component registry for PayKit integrations. Compatible with [shadcn/ui](https://ui.shadcn.com) CLI.

## Installation

### Option 1: Direct URL (Quick Start)

Add PayKit integrations directly without configuration:

```bash
# Add a Stripe integration for Next.js
npx shadcn@latest add https://usepaykit.dev/r/stripe-nextjs

# Add a Stripe integration for Hono
npx shadcn@latest add https://usepaykit.dev/r/stripe-hono

# Add Stripe with Drizzle ORM support
npx shadcn@latest add https://usepaykit.dev/r/stripe-hono-drizzle

# Add PayPal for Next.js
npx shadcn@latest add https://usepaykit.dev/r/paypal-nextjs

# Add PayPal with Prisma ORM
npx shadcn@latest add https://usepaykit.dev/r/paypal-nextjs-prisma
```

### Option 2: Namespace Configuration (Recommended)

Configure the PayKit registry once in your `components.json`:

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
    "utils": "@/lib/utils"
  },
  "registries": {
    "@paykit": "https://usepaykit.dev/r/{name}"
  }
}
```

Then install integrations using the namespace:

```bash
npx shadcn@latest add @paykit/stripe-nextjs
npx shadcn@latest add @paykit/stripe-hono
npx shadcn@latest add @paykit/paypal-nextjs
```

## Naming Convention

Registry items follow a structured naming pattern:

```
{provider}-{backend}[-{orm}][-{feature}]
```

| Component  | Required    | Options                                     | Example  |
| ---------- | ----------- | ------------------------------------------- | -------- |
| `Provider` | ✅ Yes      | `stripe`, `paypal`, `polar`, `lemonsqueezy` | `stripe` |
| `Backend`  | ✅ Yes      | `nextjs`, `hono`, `express`, `fastify`      | `nextjs` |
| `Feature`  | ❌ Optional | `hooks`                                     | `hooks`  |
| `ORM`      | ❌ Optional | `prisma`, `drizzle`, `mongoose`             | `prisma` |

### Examples

| Pattern            | Registry Name          | Description                                 |
| ------------------ | ---------------------- | ------------------------------------------- |
| Provider + Backend | `stripe-nextjs`        | Basic Stripe integration for Next.js        |
| + ORM              | `stripe-nextjs-prisma` | Stripe with Prisma database support         |
| + Feature          | `stripe-nextjs-hooks`  | Stripe with React hooks (useCheckout, etc.) |

### Real-World Examples

```
stripe-nextjs                    → Stripe × Next.js
stripe-nextjs-prisma             → Stripe × Next.js × Prisma
stripe-nextjs-prisma-hooks       → Stripe × Next.js × Prisma × React Hooks
stripe-hono-drizzle              → Stripe × Hono × Drizzle
paypal-nextjs-prisma-embedded    → PayPal × Next.js × Prisma × Embedded Checkout
```

## ⚠️ Important: Use Full Names

You **must** provide the full registry name including the backend framework. Partial names will fail with helpful suggestions:

```bash
# ❌ This will fail
npx shadcn@latest add @paykit/stripe-prisma

Error: Registry item "stripe-prisma" not found.

Did you mean one of these?
  • stripe-nextjs-prisma
  • stripe-hono-prisma
  • stripe-express-prisma
  • stripe-fastify-prisma

Tip: Full pattern is {provider}-{backend}[-{orm}][-{feature}]
```

```bash
# ✅ This will work
npx shadcn@latest add @paykit/stripe-nextjs-prisma
```

## Available Integrations

### Stripe

- `stripe-nextjs` - Stripe for Next.js App Router
- `stripe-nextjs-prisma` - Stripe for Next.js with Prisma ORM
- `stripe-hono` - Stripe for Hono backend
- `stripe-hono-drizzle` - Stripe for Hono with Drizzle ORM

### PayPal

- `paypal-nextjs` - PayPal for Next.js App Router
- `paypal-nextjs-prisma` - PayPal for Next.js with Prisma ORM

### Polar

Coming soon...

### View All Integrations

```bash
# List all available integrations
curl https://usepaykit.dev/r
```

## Registry Structure

The registry follows the [shadcn/ui registry schema](https://ui.shadcn.com/docs/registry/registry-json):

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "paykit",
  "items": [
    {
      "name": "stripe-nextjs",
      "type": "registry:block",
      "description": "...",
      "dependencies": [...],
      "files": [...]
    }
  ]
}
```

## License

ISC

## Links

- [Documentation](https://paykit.dev)
- [GitHub](https://github.com/usepaykit/paykit-sdk)
