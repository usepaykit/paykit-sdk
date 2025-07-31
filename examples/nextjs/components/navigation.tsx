'use client';

import { mockUser } from '@/lib/mock-data';
import { Button, Avatar, DropdownMenu, cn } from '@paykit-sdk/ui';
import { Settings, LogOut, User, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ToggleTheme } from './toggle-theme';

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-card/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="font-outfit text-foreground text-2xl font-bold">
              Acme Taskboard
            </Link>

            <div className="hidden space-x-6 md:flex">
              <Link
                href="/dashboard"
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive('/dashboard') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/tasks"
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive('/tasks') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Tasks
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ToggleTheme />
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar.Root className="h-8 w-8">
                    <Avatar.Image src={mockUser.avatar || '/placeholder.svg'} alt={mockUser.name} />
                    <Avatar.Fallback>{mockUser.name.charAt(0)}</Avatar.Fallback>
                  </Avatar.Root>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{mockUser.name}</p>
                    <p className="text-muted-foreground w-[200px] truncate text-sm">{mockUser.email}</p>
                  </div>
                </div>
                <DropdownMenu.Separator />
                <DropdownMenu.Item asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </nav>
  );
}
