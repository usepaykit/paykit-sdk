import React from 'react';
import { CopyButton } from '@/components/copy-button';
import { FinalCTA } from '@/components/final-cta';
import { Paykit as PaykitIcon } from '@/components/icons';
import { LifetimeAccess } from '@/components/lifetime-access';
import { ProviderDemo } from '@/components/provider-demo';
import { ReactHooksDemo } from '@/components/react-hooks-demo';
import { SiteHeader } from '@/components/site-header';
import { SponsorContact } from '@/components/sponsor-contact';
import PaypalLogo from '@/public/providers/paypal.webp';
import PolarLogo from '@/public/providers/polar.jpg';
import StripeLogo from '@/public/providers/stripe.jpeg';
import { Separator, Button, Badge, cn } from '@paykit-sdk/ui';
import { BookOpen, Zap, Github, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

export const dynamic = 'force-dynamic';

const Index = () => {
  return (
    <div className="font-inter bg-background font-pt-sans min-h-screen">
      <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-3">
            <PaykitIcon className="text-foreground size-4" />
            <span className="text-xl font-bold tracking-tight">PayKit</span>
          </Link>

          <SiteHeader />
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-12 pb-24">
        {/* Hero Section */}
        <div className="mb-16 space-y-6 text-center">
          <div className="bg-muted/50 inline-flex items-center space-x-2 rounded-full border px-4 py-2 text-sm">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground">Open Source Payment Toolkit</span>
            <Badge variant="secondary" className="ml-2">
              TypeScript
            </Badge>
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Build payments
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              without vendor lock-in
            </span>
          </h1>

          <div className="flex flex-col items-center">
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed md:text-2xl">
              PayKit lets you build payments with a consistent Typescript API.
            </p>
            <p className="text-muted-foreground mx-auto -mt-2 max-w-3xl text-xl leading-relaxed md:text-2xl">
              Switch providers later by swapping the adapter.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <CopyButton
              className="min-h-fit max-w-full overflow-hidden px-4 py-3 text-left break-words whitespace-pre-wrap"
              value="npx shadcn@latest add https://www.usepaykit.dev/r/stripe-nextjs-hooks"
              variant="outline"
              size="lg"
            >
              npx shadcn@latest add https://usepaykit.dev/r/stripe-nextjs-hooks
            </CopyButton>
          </div>
        </div>

        <div className="mx-auto mb-16 text-center">
          <h2 className="mb-8 text-3xl font-bold">
            Integrates with your favorite providers
          </h2>
          <div className="mx-auto flex w-full max-w-sm items-center justify-center">
            <div className="flex items-center">
              {[
                { logo: StripeLogo, name: 'Stripe' },
                { logo: PolarLogo, name: 'Polar' },
                { logo: PaypalLogo, name: 'Paypal' },
              ].map((provider, index) => (
                <div
                  key={provider.name}
                  className={cn(
                    `border-background-foreground size-12 overflow-hidden rounded-full border-2`,
                    index > 0 && '-ml-4',
                  )}
                >
                  <Image
                    src={provider.logo}
                    alt={provider.name}
                    width={50}
                    height={50}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Connection line */}
            <div className="mx-4 flex-1">
              <div className="bg-primary h-0.5 w-full"></div>
            </div>

            {/* PayKit core */}
            <PaykitIcon className="text-foreground size-12" />
          </div>
        </div>
      </main>

      <ProviderDemo />

      <ReactHooksDemo />

      <LifetimeAccess />

      <SponsorContact />

      <FinalCTA />

      {/* Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <PaykitIcon className="size-5 text-blue-500" />
                <span className="text-lg font-bold">PayKit</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The payment toolkit for TypeScript developers. Build locally, deploy
                anywhere.
              </p>
              <div className="flex items-center space-x-1">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/docs/introduction">
                    <BookOpen className="size-4" />
                  </Link>
                </Button>

                <Button asChild variant="ghost" size="sm">
                  <Link
                    href="https://github.com/usepaykit"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="size-4" />
                  </Link>
                </Button>

                <Button asChild variant="ghost" size="sm">
                  <Link
                    href="https://x.com/usepaykit"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TwitterIcon className="size-4" />
                  </Link>
                </Button>

                <Button asChild variant="ghost" size="sm">
                  <Link
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Coming soon"
                  >
                    <MessageCircle className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/providers/overview"
                    className="hover:text-foreground transition-colors"
                  >
                    Providers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/providers/adapters"
                    className="hover:text-foreground transition-colors"
                  >
                    Adapters
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
                  <Link
                    href="/docs/api-reference"
                    className="hover:text-foreground transition-colors"
                  >
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/framework-examples"
                    className="hover:text-foreground transition-colors"
                  >
                    Framework Examples
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src="/odii.png"
                  alt="Emmanuel Odii"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-muted-foreground text-sm">
                Hey Curious 👋 I’m
                <Link
                  href="https://odii.vercel.app"
                  target="_blank"
                  className="text-foreground ml-1 font-medium hover:underline"
                >
                  Emmanuel
                </Link>
                , the creator of PayKit. You can follow my work on
                <Link
                  href="https://x.com/devodii_"
                  target="_blank"
                  className="text-foreground ml-1 font-medium underline hover:underline"
                >
                  Twitter
                </Link>{' '}
                or
                <Link
                  href="https://www.linkedin.com/in/emmanuelodii/"
                  target="_blank"
                  className="text-foreground ml-1 font-medium underline hover:underline"
                >
                  LinkedIn
                </Link>
              </p>
            </div>

            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} PayKit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
