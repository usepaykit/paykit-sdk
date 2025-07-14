'use client';

import { Button, Badge } from '@paykit-sdk/ui';
import { BarChart3, Settings, HelpCircle, Zap } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function DashboardHeader() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Zap className="text-primary-foreground h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">PayKit</span>
              <span className="text-muted-foreground text-xs">Analytics</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Local Provider
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Button variant="ghost" size="sm" className="text-sm font-medium">
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" className="text-sm font-medium">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="text-sm font-medium">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </Button>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            Development Mode
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
