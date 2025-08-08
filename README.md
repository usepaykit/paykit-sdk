# PayKit

The Payment Toolkit for TypeScript developers.

PayKit is a unified SDK that simplifies payment processing across different providers with a consistent API.

## Quick Start

Choose your preferred way to get started:

### 1. Using the CLI (Recommended)

```bash
npx @paykit-sdk/cli@latest init
```

### 2. Manual Installation

```bash
npm install @paykit-sdk/core @paykit-sdk/stripe
```

Then follow the [Core Package documentation](packages/paykit/README.md) for setup.

## Packages

| Package                                           | Description                |
| ------------------------------------------------- | -------------------------- |
| [`@paykit-sdk/core`](packages/paykit)             | Main PayKit SDK            |
| [`@paykit-sdk/react`](packages/react)             | React hooks and components |
| [`@paykit-sdk/cli`](packages/cli)                 | CLI for project setup      |
| **Providers**                                     |                            |
| [`@paykit-sdk/stripe`](packages/stripe)           | Stripe integration         |
| [`@paykit-sdk/polar`](packages/polar)             | Polar integration          |
| [`@paykit-sdk/local`](packages/local)             | Local development provider |
| **Tools**                                         |                            |
| [`@paykit-sdk/ui`](packages/ui)                   | UI components              |
| [Custom Provider Guide](packages/custom-provider) | Build your own provider    |

## Documentation

Visit [paykit.dev](https://usepaykit.dev) for complete documentation, examples, and guides.

---

Maintained by [Emmanuel Odii](https://github.com/devodii)
