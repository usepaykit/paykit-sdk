import React from 'react';
import { Button } from '@/components/ui/button';
import { Github, BookOpen, ArrowRight, Zap, } from 'lucide-react';

const Index = () => {
  return (
    <div className="font-inter min-h-screen bg-gray-50">

      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-slate-900">Paykit</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-slate-600">
            <BookOpen className="mr-2 h-4 w-4" />
            Docs
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-600">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <div className="animate-fade-in space-y-8 text-center">
          <h1 className="font-arizonia text-6xl font-bold leading-tight tracking-tight text-slate-900 md:text-7xl lg:text-8xl">
            The Payment Toolkit for TypeScript
          </h1>

          <p className="font-inter mx-auto max-w-3xl text-xl leading-relaxed text-slate-600 md:text-2xl">
            Paykit SDK is a free open-source library that gives you the tools
            you need to add payments to your app.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 pt-8 sm:flex-row">
            <Button
              size="lg"
              variant='default'
              className="rounded-xl px-8 py-6 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Explore Docs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
                className="rounded-xl border-2 border-slate-300 px-8 py-6 text-lg font-semibold transition-all duration-200 hover:border-slate-400"
            >
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
