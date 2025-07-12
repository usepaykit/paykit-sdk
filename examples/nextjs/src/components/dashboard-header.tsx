'use client';

import { Button, Badge } from '@paykit-sdk/ui';
import { ThemeToggle } from './theme-toggle';
import { BarChart3, Settings, HelpCircle, Zap } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">PayKit</span>
              <span className="text-xs text-muted-foreground">Analytics</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Local Provider
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Button variant="ghost" size="sm" className="text-sm font-medium">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" className="text-sm font-medium">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="text-sm font-medium">
            <HelpCircle className="h-4 w-4 mr-2" />
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