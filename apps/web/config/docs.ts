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
        { title: 'Introduction', href: '/docs/introduction', items: [] },
        {
          title: 'Installation',
          href: '/docs/installation-root',
          items: [
            { title: 'React', href: '/docs/vitejs-installation', items: [] },
            { title: 'Next.js', href: '/docs/nextjs-installation', items: [] },
          ],
        },
        { title: 'Quick Start', href: '/docs/getting-started', items: [] },
      ],
    },
    {
      title: 'Payment Providers',
      items: [
        { title: 'Overview', href: '/docs/providers/overview', items: [] },
        { title: 'Local', href: '/docs/providers/local', items: [] },
        { title: 'Stripe', href: '/docs/providers/stripe', items: [] },
        { title: 'Polar', href: '/docs/providers/polar', items: [] },
      ],
    },
    {
      title: 'Core Concepts',
      items: [
        { title: 'API Reference', href: '/docs/concepts/api-reference', items: [] },
        { title: 'Error Handling', href: '/docs/concepts/error-handling', items: [] },
        {
          title: 'Client Side Integration',
          href: '/docs/concepts/client-side-usage',
          items: [],
        },
        { title: 'Framework Examples', href: '/docs/framework-examples', items: [] },
      ],
    },
  ],
} satisfies {
  sidebarNav: DocsSidebarNav[];
};
