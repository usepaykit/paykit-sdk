import React from 'react';
import { CopyButton } from '@/components/copy-button';
import { FinalCTA } from '@/components/final-cta';
import { LifetimeAccess } from '@/components/lifetime-access';
import { LocalCheckoutSession } from '@/components/local-checkout-session';
import { ProviderDemo } from '@/components/provider-demo';
import { ReactHooksDemo } from '@/components/react-hooks-demo';
import { ThemeToggle } from '@/components/theme-toggle';
import GumroadLogo from '@/public/providers/gumroad.webp';
import PolarLogo from '@/public/providers/polar.jpg';
import StripeLogo from '@/public/providers/stripe.jpeg';
import { Separator, Button, Badge, cn } from '@paykit-sdk/ui';
import { BookOpen, Zap, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const Index = () => {
  return (
    <div className="font-inter bg-background min-h-screen">
      <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-3">
            <Sparkles className="text-foreground size-4" />
            <span className="text-xl font-bold tracking-tight">PayKit</span>
          </Link>

          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/docs/introduction">
                <BookOpen className="size-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-12 pb-24">
        {/* Hero Section */}
        <div className="mb-16 space-y-6 text-center">
          <div className="bg-muted/50 inline-flex items-center space-x-2 rounded-full border px-4 py-2 text-sm">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground">Payment Toolkit</span>
            <Badge variant="secondary" className="ml-2">
              TypeScript
            </Badge>
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Build payments
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">without vendor lock-in</span>
          </h1>

          <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed md:text-2xl">
            PayKit lets you build billing systems that work locally, then deploy anywhere. Switch providers with a single line of code.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <CopyButton value="npx @paykit-sdk/cli@latest init" variant="outline" size="lg">
              npx @paykit-sdk/cli@latest init
            </CopyButton>
          </div>
        </div>

        <div className="mx-auto mb-16 text-center">
          <h2 className="mb-8 text-3xl font-bold">Integrates with your favorite providers</h2>
          <div className="mx-auto flex w-full max-w-sm items-center justify-center">
            <div className="flex items-center">
              {[
                { logo: StripeLogo, name: 'Stripe' },
                { logo: PolarLogo, name: 'Polar' },
                { logo: GumroadLogo, name: 'Gumroad' },
              ].map((provider, index) => (
                <div
                  key={provider.name}
                  className={cn(`border-background-foreground size-12 overflow-hidden rounded-full border-2`, index > 0 && '-ml-3')}
                >
                  <Image src={provider.logo} alt={provider.name} width={50} height={50} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>

            {/* Connection line */}
            <div className="mx-4 flex-1">
              <div className="bg-primary h-0.5 w-full"></div>
            </div>

            {/* PayKit core */}
            <Sparkles className="text-foreground size-12" />
          </div>
        </div>
      </main>

      <ProviderDemo />

      <ReactHooksDemo />

      <LocalCheckoutSession />

      <LifetimeAccess />

      <FinalCTA />

      {/* Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <span className="text-lg font-bold">PayKit</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The payment toolkit for TypeScript developers. Build locally, deploy anywhere.
              </p>
              <div className="flex items-center space-x-4">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/docs/introduction">
                    <BookOpen className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link href="/docs/features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/docs/providers/overview" className="hover:text-foreground transition-colors">
                    Providers
                  </Link>
                </li>
                <li>
                  <Link href="/docs/providers/local" className="hover:text-foreground transition-colors">
                    Local Development
                  </Link>
                </li>
              </ul>
            </div>

            {/* Developers */}
            <div className="space-y-4">
              <h3 className="font-semibold">Developers</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="docs/examples" className="hover:text-foreground transition-colors">
                    Examples
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="font-semibold">Company</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="mailto:emmanuelodii80@gmail.com" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-muted-foreground text-sm">© 2024 PayKit. All rights reserved.</p>
            <p className="text-muted-foreground text-sm">
              Built with ❤️ by
              <Link href="https://x.com/devodii_" target="_blank" className="text-foreground ml-1 underline">
                Odii
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
