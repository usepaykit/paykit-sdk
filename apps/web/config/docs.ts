import { Doc } from 'contentlayer/generated';

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface DocsSidebarNav {
  title: string;
  items: NavItemWithChildren[];
}

export const docsConfig = {
  sidebarNav: [
    {
      title: 'Getting Started',
      items: [
        {
          title: 'Introduction',
          href: '/docs',
          items: [],
        },
        {
          title: 'Installation',
          href: '/docs/installation',
          items: [],
        },
        {
          title: 'Quick Start',
          href: '/docs/getting-started',
          items: [],
        },
      ],
    },
    {
      title: 'Payment Providers',
      items: [
        {
          title: 'Stripe',
          href: '/docs/providers/stripe',
          items: [],
        },
        {
          title: 'Polar',
          href: '/docs/providers/polar',
          items: [],
        },
        {
          title: 'Gumroad',
          href: '/docs/providers/gumroad',
          items: [],
        },
        {
          title: 'Gumroad',
          href: '/docs/providers/gumroad',
          items: [],
        },
      ],
    },
    {
      title: 'Core Concepts',
      items: [
        {
          title: 'Payment Flow',
          href: '/docs/concepts/payment-flow',
          items: [],
        },
        {
          title: 'Webhooks',
          href: '/docs/concepts/webhooks',
          items: [],
        },
        {
          title: 'Error Handling',
          href: '/docs/concepts/error-handling',
          items: [],
        },
        {
          title: 'Testing',
          href: '/docs/concepts/testing',
          items: [],
        },
      ],
    },
    {
      title: 'API Reference',
      items: [
        {
          title: 'Core API',
          href: '/docs/api-reference',
          items: [],
        },
        {
          title: 'Types',
          href: '/docs/api-reference/types',
          items: [],
        },
        {
          title: 'Utilities',
          href: '/docs/api-reference/utilities',
          items: [],
        },
      ],
    },
    {
      title: 'Guides',
      items: [
        {
          title: 'React Integration',
          href: '/docs/guides/react',
          items: [],
        },
        {
          title: 'Next.js Setup',
          href: '/docs/guides/nextjs',
          items: [],
        },
        {
          title: 'Webhook Setup',
          href: '/docs/guides/webhooks',
          items: [],
        },
        {
          title: 'Production Deployment',
          href: '/docs/guides/deployment',
          items: [],
        },
      ],
    },
    {
      title: 'Examples',
      items: [
        {
          title: 'Basic Payment',
          href: '/docs/examples/basic-payment',
          items: [],
        },
        {
          title: 'Subscription',
          href: '/docs/examples/subscription',
          items: [],
        },
        {
          title: 'One-time Purchase',
          href: '/docs/examples/one-time',
          items: [],
        },
      ],
    },
  ],
} satisfies {
  sidebarNav: DocsSidebarNav[];
};
