import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@paykit-sdk/ui';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-3">
            <Sparkles className="text-foreground size-4" />
            <span className="text-xl font-bold tracking-tight">PayKit</span>
          </Link>

          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/docs">
                <BookOpen className="size-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight">Building the modern payment platform</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            A unified SDK that abstracts away the complexity of payment providers, allowing developers to focus on what matters most.
          </p>
        </div>

        {/* My Story */}
        <div className="mx-auto flex max-w-2xl flex-col items-center space-y-8">
          <h2 className="text-foreground text-center text-2xl font-semibold">My Story</h2>

          <div className="border-primary/20 relative mb-8 h-48 w-48 overflow-hidden rounded-full border-4">
            <Image src="/odii.png" alt="Emmanuel Odii" fill className="object-cover" priority />
          </div>

          <div className="text-muted-foreground space-y-4 leading-relaxed">
            <p>
              I'm Emmanuel Odii, a 19yo dev from Nigeria who started my coding journey in 2022. Since then, I've built several applications including
              tarotmaster.ai and classynotes.app.
            </p>
            <p>
              Each time I built these applications, I found myself diving deep into payment provider documentation to implement the abstractions I
              needed. Whether it was Stripe, Polar, or other payment systems, I was constantly rewriting payment flows and webhook handlers.
            </p>

            <p>This repetitive process of studying docs, implementing payment logic, and managing provider-specific code led me to build PayKit</p>

            <p>
              PayKit is the solution I wish I had when building my first applications. It's designed to help developers focus on their core product
              rather than payment infrastructure.
            </p>
          </div>
        </div>

        {/* Investors */}
        <div className="mt-16 flex flex-col items-center space-y-6">
          <h2 className="text-foreground text-center text-2xl font-semibold">Investors</h2>
          <div className="text-muted-foreground max-w-2xl space-y-4 text-center">
            <p>Open to investment opportunities and partnerships.</p>
          </div>
          <Button asChild>
            <Link href="mailto:emmanuelodii80@gmail.com?subject=Investment Opportunity - PayKit">Get in Touch</Link>
          </Button>
        </div>

        {/* Back to Home */}
        <div className="mt-16 text-center">
          <Link href="/">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
