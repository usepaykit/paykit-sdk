import { Card, Button, Badge, Separator } from '@paykit-sdk/ui';
import { Zap, BookOpen, ExternalLink, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../components/theme-toggle';

export default function IndexPage() {
  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-br">
      {/* Header */}
      <header className="bg-background/80 border-b backdrop-blur-sm">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Zap className="text-primary-foreground h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold">PayKit</h1>
            <Badge variant="secondary" className="text-xs">
              Local Provider
            </Badge>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight">
              Welcome to <span className="text-primary">PayKit</span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Your local development environment for building and testing payment integrations with ease.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" variant="outline" asChild>
              <Link href="https://paykit-web.vercel.app/docs" target="_blank" rel="noopener noreferrer">
                <BookOpen className="mr-2 h-4 w-4" />
                View Documentation
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold">Getting Started</h2>
            <p className="text-muted-foreground">Follow these simple steps to start building with PayKit Local Provider</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card.Root>
              <Card.Content className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                    1
                  </div>
                  <h3 className="text-lg font-semibold">Create a Checkout</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Learn how to create your first checkout session using PayKit&apos;s React hooks.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="https://paykit.dev/docs/getting-started" target="_blank" rel="noopener noreferrer">
                    View Tutorial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </Card.Content>
            </Card.Root>

            <Card.Root>
              <Card.Content className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <h3 className="text-lg font-semibold">Explore Examples</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Check out our comprehensive examples for Next.js, React, and Node.js applications.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="https://paykit-web.vercel.app/docs/examples" target="_blank" rel="noopener noreferrer">
                    Browse Examples
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </Card.Content>
            </Card.Root>
          </div>
        </div>
      </section>

      {/* Current Status */}
      <section className="container max-w-7xl mx-auto px-4 py-16">
        <Card.Root className="bg-muted/30">
          <Card.Content className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold">Local Provider Active</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your PayKit local provider is running and ready for development. All API endpoints are available at localhost.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">3001</div>
                <div className="text-xs text-muted-foreground">Port</div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">●</div>
                <div className="text-xs text-muted-foreground">Online</div>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      </section>
    </div>
  );
}
