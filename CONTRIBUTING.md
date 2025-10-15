# Contributing to PayKit

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Monorepo Structure

This is a pnpm workspace monorepo with the following structure:

```
paykit/
├── apps/
│   └── web/              # Documentation website
├── packages/
│   ├── paykit/           # Core SDK
│   ├── stripe/           # Stripe provider
│   ├── polar/            # Polar provider
│   ├── paypal/           # PayPal provider
│   ├── react/            # React hooks
│   ├── registry/         # Component registry
│   └── ui/               # UI components
└── tsup.config.base.ts   # Shared build config
```

## Build Configuration

We use a shared tsup configuration for consistent builds across all packages.

### Using the Shared Config

Create a `tsup.config.ts` in your package:

```typescript
import { createTsupConfig } from '../../tsup.config.base';

// Basic usage
export default createTsupConfig();
```

### Customizing the Config

Pass options to override defaults:

```typescript
import { createTsupConfig } from '../../tsup.config.base';

export default createTsupConfig({
  // Mark dependencies as external
  external: ['react', 'react-dom'],

  // Or customize entry points
  entry: ['src/index.ts', 'src/cli.ts'],

  // Or any other tsup option
  minify: true,
});
```

### Package.json Setup

Your package.json should have:

```json
{
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup"
  }
}
```

## Adding a New Package

1. Create package directory in `packages/`
2. Add `package.json` with proper exports
3. Create `tsup.config.ts` using shared config
4. Add `src/index.ts` as entry point
5. Run `pnpm build` from root

Example:

```bash
# Create new package
mkdir packages/my-provider
cd packages/my-provider

# Initialize package.json
npm init -y

# Add tsup config
cat > tsup.config.ts << 'EOF'
import { createTsupConfig } from '../../tsup.config.base';

export default createTsupConfig();
EOF

# Create source
mkdir src
echo "export const hello = 'world';" > src/index.ts

# Build
cd ../..
pnpm build
```

##

## Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Run `pnpm lint` before committing
- Format with Prettier: `pnpm format`

## Questions?

- [GitHub Issues](https://github.com/usepaykit/paykit-sdk/issues)
- [Discord Community](https://discord.gg/paykit)
