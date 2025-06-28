import React from 'react';
import { ProviderDemo } from '@/components/provider-demo';
import { Spinner } from '@/components/spinner';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Github, BookOpen, ArrowRight, Zap, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="font-inter bg-background min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-foreground h-5 w-5" />
          <span className="text-foreground text-xl font-semibold">Paykit</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="">
            <BookOpen className="mr-2 h-4 w-4" />
            Docs
          </Button>
          <Button variant="ghost" size="sm" className="">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <div className="animate-fade-in space-y-8 text-center">
          <h1 className="text-foreground text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-6xl">
            The Payment Toolkit for TypeScript
          </h1>

          <p className="font-inter text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed md:text-2xl">
            Paykit SDK is a free open-source library that gives you the tools you need to add payments to your app.
          </p>

          <Spinner />

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 pt-8 sm:flex-row">
            <Button size="lg" variant="default">
              <BookOpen className="mr-2 h-5 w-5" />
              Explore Docs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button variant="default" size="lg">
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </Button>
          </div>
        </div>
      </main>

      {/* Provider Demo */}
      <ProviderDemo />
    </div>
  );
};

export default Index;
