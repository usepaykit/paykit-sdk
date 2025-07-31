import { Navigation } from '@/components/navigation';
import { pricingPlans } from '@/lib/mock-data';
import { Card, Button, Badge, cn } from '@paykit-sdk/ui';
import { Check, Sparkles, Zap, Users, Shield, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="space-y-8">
            <Badge className="gradient-bg mx-auto border-0 text-white">
              <Sparkles className="mr-2 h-4 w-4" />
              AI-Powered Task Management
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Supercharge Your
              <span className="gradient-text block">Productivity</span>
            </h1>

            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
              Transform your workflow with AI-powered task management. Generate detailed task descriptions, organize your projects, and boost
              productivity like never before.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="gradient-bg border-0 px-8 text-white">
                <Link href="/dashboard">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Free forever plan
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Setup in minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Everything you need to stay organized</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Powerful features designed to help you manage tasks efficiently and boost your productivity.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card.Root className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <Card.Header>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <Card.Title>AI Content Generation</Card.Title>
                <Card.Description>Generate detailed task descriptions and content with advanced AI technology.</Card.Description>
              </Card.Header>
            </Card.Root>

            <Card.Root className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <Card.Header>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <Card.Title>Smart Task Management</Card.Title>
                <Card.Description>Organize, prioritize, and track your tasks with intelligent categorization and status tracking.</Card.Description>
              </Card.Header>
            </Card.Root>

            <Card.Root className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <Card.Header>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <Card.Title>Team Collaboration</Card.Title>
                <Card.Description>Work together seamlessly with team features, shared projects, and real-time updates.</Card.Description>
              </Card.Header>
            </Card.Root>

            <Card.Root className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <Card.Header>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <Card.Title>Secure & Private</Card.Title>
                <Card.Description>Your data is protected with enterprise-grade security and privacy controls.</Card.Description>
              </Card.Header>
            </Card.Root>

            <Card.Root className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <Card.Header>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                  <Star className="h-6 w-6 text-red-600" />
                </div>
                <Card.Title>Advanced Templates</Card.Title>
                <Card.Description>Pre-built templates for common workflows and project types to get started quickly.</Card.Description>
              </Card.Header>
            </Card.Root>

            <Card.Root className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <Card.Header>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <ArrowRight className="h-6 w-6 text-indigo-600" />
                </div>
                <Card.Title>Seamless Integration</Card.Title>
                <Card.Description>Connect with your favorite tools and services for a unified workflow experience.</Card.Description>
              </Card.Header>
            </Card.Root>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">Choose the perfect plan for your needs. Upgrade or downgrade at any time.</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {pricingPlans.map(plan => (
              <Card.Root
                key={plan.tier}
                className={cn(
                  'relative border-2 transition-all duration-300 hover:shadow-xl',
                  plan.popular ? 'border-primary scale-105 shadow-lg' : 'border-gray-200',
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <Badge className="gradient-bg border-0 px-4 py-1 text-white">Most Popular</Badge>
                  </div>
                )}

                <Card.Header className="pb-8 text-center">
                  <Card.Title className="text-2xl">{plan.name}</Card.Title>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>
                </Card.Header>

                <Card.Content className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={cn('w-full', plan.popular ? 'gradient-bg border-0 text-white' : '')}
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/dashboard">{plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}</Link>
                  </Button>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Ready to supercharge your productivity?</h2>
          <p className="mb-8 text-xl opacity-90">Join thousands of users who have transformed their workflow with Acme Taskboard.</p>
          <Button size="lg" variant="secondary" asChild className="px-8">
            <Link href="/dashboard">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="gradient-text mb-4 text-2xl font-bold">Acme Taskboard</div>
          <p className="mb-8 text-gray-400">AI-powered task management for modern teams</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <a href="#" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
