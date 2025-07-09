import React from 'react';
import { ProviderDemo } from '@/components/provider-demo';
import { ThemeToggle } from '@/components/theme-toggle';
import GumroadLogo from '@/public/providers/gumroad.webp';
import PolarLogo from '@/public/providers/polar.jpg';
import StripeLogo from '@/public/providers/stripe.jpeg';
import { Separator, Card, Button, Badge } from '@paykit-sdk/ui';
import {
  Github,
  BookOpen,
  ArrowRight,
  Zap,
  Sparkles,
  Code2,
  Rocket,
  Shield,
  Clock,
  Users,
  Check,
  Play,
  Terminal,
  Settings,
  Layers,
  CreditCard,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Index = () => {
  return (
    <div className="font-inter bg-background min-h-screen">
      {/* Modern Header */}
      <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-xl font-bold tracking-tight">PayKit</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 md:flex">
            <Link href="/playground">
              <Button.Root variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Play className="mr-2 h-4 w-4" />
                Playground
              </Button.Root>
            </Link>
            <Button.Root variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <BookOpen className="mr-2 h-4 w-4" />
              Documentation
            </Button.Root>
            <Button.Root variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button.Root>
            <div className="bg-border mx-2 h-4 w-px"></div>
            <ThemeToggle />
            <Button.Root size="sm" className="ml-2">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button.Root>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button.Root variant="ghost" size="sm">
              <Github className="h-4 w-4" />
            </Button.Root>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-12 pb-24">
        {/* Hero Section */}
        <div className="mb-16 space-y-6 text-center">
          <div className="bg-muted/50 inline-flex items-center space-x-2 rounded-full border px-4 py-2 text-sm">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground">Open Source Payment Toolkit</span>
            <Badge.Root variant="secondary" className="ml-2">
              TypeScript
            </Badge.Root>
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
            <Link href="/playground">
              <Button.Root size="lg" className="group">
                <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Try Playground
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button.Root>
            </Link>
            <Button.Root variant="outline" size="lg">
              <Github className="mr-2 h-5 w-5" />
              View Source
            </Button.Root>
          </div>
        </div>

        {/* Interactive Features Grid */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {/* Local Development */}
          <Card.Root className="group border-dashed transition-all duration-300 hover:border-solid hover:shadow-lg">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                  <Terminal className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <Card.Title className="text-lg">Local Provider</Card.Title>
              </div>
              <Card.Description>Start building without any payment provider setup</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              {/* Visual representation of local payment testing */}
              <div className="bg-muted/30 relative h-24 rounded-lg p-3">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10"></div>
                <div className="relative flex h-full flex-col justify-between">
                  {/* Mock payment header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">Test Mode</span>
                    </div>
                    <div className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      MOCK
                    </div>
                  </div>

                  {/* Mock payment transactions */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-3 rounded bg-green-200 dark:bg-green-800"></div>
                        <span className="text-muted-foreground">Payment #1234</span>
                      </div>
                      <span className="font-medium text-green-600">$29.99 ✓</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-3 rounded bg-green-200 dark:bg-green-800"></div>
                        <span className="text-muted-foreground">Webhook received</span>
                      </div>
                      <span className="font-medium text-green-600">200 ✓</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Zero configuration setup</span>
                </div>
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Mock webhooks & payments</span>
                </div>
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Full development workflow</span>
                </div>
              </div>
            </Card.Content>
          </Card.Root>

          {/* Provider Switching */}
          <Card.Root className="group border-dashed transition-all duration-300 hover:border-solid hover:shadow-lg">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                  <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <Card.Title className="text-lg">Provider Agnostic</Card.Title>
              </div>
              <Card.Description>Switch between Stripe, Polar, or Gumroad instantly</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              {/* Visual representation of providers connecting to PayKit */}
              <div className="bg-muted/30 relative flex h-24 items-center justify-center rounded-lg p-4">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                <div className="relative flex w-full items-center justify-between">
                  {/* Provider logos - overlapping avatars */}
                  <div className="flex items-center">
                    {[
                      { logo: StripeLogo, name: 'Stripe' },
                      { logo: PolarLogo, name: 'Polar' },
                      { logo: GumroadLogo, name: 'Gumroad' },
                    ].map((provider, index) => (
                      <div
                        key={provider.name}
                        className={`border-background h-8 w-8 overflow-hidden rounded-full border-2 ${index > 0 ? '-ml-3' : ''}`}
                      >
                        <Image src={provider.logo} alt={provider.name} width={32} height={32} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>

                  {/* Connection line */}
                  <div className="mx-4 flex-1">
                    <div className="h-0.5 w-full bg-gradient-to-r from-blue-400/30 to-blue-400"></div>
                  </div>

                  {/* PayKit core */}
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Unified API across all providers</span>
                </div>
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Switch with single line change</span>
                </div>
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Zero refactoring needed</span>
                </div>
              </div>
            </Card.Content>
          </Card.Root>

          {/* Production Ready */}
          <Card.Root className="group border-dashed transition-all duration-300 hover:border-solid hover:shadow-lg">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                  <Rocket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <Card.Title className="text-lg">Production Ready</Card.Title>
              </div>
              <Card.Description>Deploy with confidence using battle-tested patterns</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              {/* Visual representation of production deployment */}
              <div className="bg-muted/30 relative flex h-24 items-center justify-center rounded-lg p-4">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
                <div className="relative flex items-center space-x-4">
                  {/* Development */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded border-2 border-gray-300 bg-gray-400">
                      <Code2 className="h-3 w-3 text-white" />
                    </div>
                    <div className="text-muted-foreground text-xs">Dev</div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="text-muted-foreground h-4 w-4" />

                  {/* Production with security shield */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="relative">
                      <div className="flex h-6 w-6 items-center justify-center rounded border-2 border-purple-300 bg-gradient-to-br from-purple-500 to-pink-600">
                        <Rocket className="h-3 w-3 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-green-500">
                        <Shield className="h-2 w-2 text-white" />
                      </div>
                    </div>
                    <div className="text-muted-foreground text-xs">Prod</div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="text-muted-foreground h-4 w-4" />

                  {/* Scale */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded border-2 border-blue-300 bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    <div className="text-muted-foreground text-xs">Scale</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>TypeScript-first with full type safety</span>
                </div>
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Built-in webhook validation & testing</span>
                </div>
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Enterprise-grade security patterns</span>
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        </div>

        {/* Use Cases Section */}
        <div className="mb-16 space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold md:text-4xl">Perfect for every use case</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">Whether you&apos;re prototyping or scaling to millions of users</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* MVP Development */}
            <Card.Root className="group relative overflow-hidden border-dashed transition-all duration-300 hover:border-solid hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <Card.Header className="relative pb-4">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20">
                  <Code2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Card.Title className="text-lg font-semibold">MVP Development</Card.Title>
              </Card.Header>
              <Card.Content className="relative pt-0">
                <Card.Description className="text-sm leading-relaxed">
                  Build and test billing locally before choosing a payment provider
                </Card.Description>
                <div className="mt-4 inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400">
                  <span>Start building today</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </Card.Content>
            </Card.Root>

            {/* Multi-tenant SaaS */}
            <Card.Root className="group relative overflow-hidden border-dashed transition-all duration-300 hover:border-solid hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <Card.Header className="relative pb-4">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/20">
                  <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <Card.Title className="text-lg font-semibold">Multi-tenant SaaS</Card.Title>
              </Card.Header>
              <Card.Content className="relative pt-0">
                <Card.Description className="text-sm leading-relaxed">
                  Different providers per tenant or region with the same codebase
                </Card.Description>
                <div className="mt-4 inline-flex items-center text-xs font-medium text-purple-600 dark:text-purple-400">
                  <span>Scale globally</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </Card.Content>
            </Card.Root>

            {/* A/B Testing */}
            <Card.Root className="group relative overflow-hidden border-dashed transition-all duration-300 hover:border-solid hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <Card.Header className="relative pb-4">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/20">
                  <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <Card.Title className="text-lg font-semibold">A/B Testing</Card.Title>
              </Card.Header>
              <Card.Content className="relative pt-0">
                <Card.Description className="text-sm leading-relaxed">Test different payment providers to optimize conversion rates</Card.Description>
                <div className="mt-4 inline-flex items-center text-xs font-medium text-yellow-600 dark:text-yellow-400">
                  <span>Optimize conversions</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </Card.Content>
            </Card.Root>

            {/* Migration */}
            <Card.Root className="group relative overflow-hidden border-dashed transition-all duration-300 hover:border-solid hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <Card.Header className="relative pb-4">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/20">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <Card.Title className="text-lg font-semibold">Migration</Card.Title>
              </Card.Header>
              <Card.Content className="relative pt-0">
                <Card.Description className="text-sm leading-relaxed">
                  Migrate between providers without rewriting your billing logic
                </Card.Description>
                <div className="mt-4 inline-flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                  <span>Seamless migration</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </Card.Content>
            </Card.Root>
          </div>
        </div>

        <Separator.Root className="my-16" />
      </main>

      {/* Provider Demo */}
      <ProviderDemo />

      {/* Checkout Experience Section */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <div className="mb-8 space-y-2">
              <div className="bg-muted/50 mb-4 inline-flex items-center space-x-2 rounded-full border px-4 py-2 text-sm">
                <CreditCard className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Complete Checkout Experience</span>
                <Badge.Root variant="outline" className="ml-2">
                  Demo
                </Badge.Root>
              </div>
              <h2 className="text-3xl font-bold md:text-4xl">
                Production-ready checkout flows
                <br />
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  built for developers
                </span>
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-xl">See what your customers experience with PayKit&apos;s local provider</p>
            </div>

            <div className="bg-muted/20 relative rounded-2xl border p-1">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20"></div>
              <div className="bg-background relative space-y-6 rounded-xl p-8 md:p-12">
                {/* Browser Chrome */}
                <div className="mx-auto max-w-4xl">
                  <div className="bg-muted rounded-t-lg border p-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="h-3 w-3 rounded-full bg-red-400"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                        <div className="h-3 w-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="bg-background text-muted-foreground flex-1 rounded px-3 py-1 text-xs">localhost:3000/checkout</div>
                    </div>
                  </div>

                  {/* Checkout Preview */}
                  <div className="bg-background rounded-b-lg border border-t-0 p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Form Preview */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-left font-semibold">Secure Checkout</h3>
                          <p className="text-muted-foreground text-left text-sm">Powered by PayKit Local Provider</p>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-muted/30 rounded-lg border p-3">
                            <div className="mb-2 text-left text-xs font-medium">Customer Information</div>
                            <div className="space-y-2">
                              <div className="bg-background text-muted-foreground h-6 rounded border px-2 py-1 text-xs">john@example.com</div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-background text-muted-foreground h-6 rounded border px-2 py-1 text-xs">John</div>
                                <div className="bg-background text-muted-foreground h-6 rounded border px-2 py-1 text-xs">Doe</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-lg border p-3">
                            <div className="mb-2 text-left text-xs font-medium">Payment Method</div>
                            <div className="bg-background text-muted-foreground h-6 rounded border px-2 py-1 text-xs">4242 4242 4242 4242</div>
                          </div>
                        </div>
                      </div>

                      {/* Order Summary Preview */}
                      <div className="space-y-4">
                        <div className="bg-muted/30 rounded-lg border p-4">
                          <div className="mb-3 text-left text-xs font-medium">Order Summary</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">PayKit Pro License</span>
                              <span className="font-medium">$99.00</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Local provider fee</span>
                              <span className="font-medium text-green-600">$0.00</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between text-sm font-bold">
                                <span>Total</span>
                                <span>$99.00</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="bg-primary text-primary-foreground w-full rounded px-3 py-2 text-center text-xs font-medium">
                              Complete Payment - $99.00
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="inline-flex items-center space-x-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-600 dark:bg-green-900/20">
                            <Shield className="h-3 w-3" />
                            <span>Local Provider Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Link href="/checkout">
                    <Button.Root size="lg" variant="outline" className="group">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Try Live Checkout Demo
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button.Root>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative py-16">
        <div className="from-muted/20 via-background to-muted/20 absolute inset-0 bg-gradient-to-r"></div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold md:text-3xl">Trusted by developers worldwide</h2>
              <p className="text-muted-foreground mx-auto max-w-2xl">Join thousands of developers building the future of payments</p>
            </div>

            <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-4">
              <div className="space-y-2 text-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">10K+</div>
                <div className="text-muted-foreground text-sm">Downloads</div>
              </div>
              <div className="space-y-2 text-center">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">500+</div>
                <div className="text-muted-foreground text-sm">Developers</div>
              </div>
              <div className="space-y-2 text-center">
                <div className="bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-3xl font-bold text-transparent">99.9%</div>
                <div className="text-muted-foreground text-sm">Uptime</div>
              </div>
              <div className="space-y-2 text-center">
                <div className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent">24/7</div>
                <div className="text-muted-foreground text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                Ready to build
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  payment-agnostic apps?
                </span>
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-xl">Start with local development today. Deploy to any provider tomorrow.</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button.Root size="lg" className="group">
                <Terminal className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                npx paykit-sdk@latest
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button.Root>
              <Button.Root variant="outline" size="lg">
                <BookOpen className="mr-2 h-5 w-5" />
                Read Documentation
              </Button.Root>
            </div>
          </div>
        </div>
      </section>

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
                <Button.Root variant="ghost" size="sm">
                  <Github className="h-4 w-4" />
                </Button.Root>
                <Button.Root variant="ghost" size="sm">
                  <BookOpen className="h-4 w-4" />
                </Button.Root>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Providers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Local Development
                  </a>
                </li>
              </ul>
            </div>

            {/* Developers */}
            <div className="space-y-4">
              <h3 className="font-semibold">Developers</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Examples
                  </a>
                </li>
                <li>
                  <a href="https://github.com/devodii/paykit" target="_blank" className="hover:text-foreground transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="font-semibold">Company</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator.Root className="my-8" />

          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-muted-foreground text-sm">© 2024 PayKit. All rights reserved.</p>
            <div className="text-muted-foreground flex items-center space-x-6 text-sm">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
