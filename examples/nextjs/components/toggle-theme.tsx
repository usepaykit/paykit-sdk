'use client';

import * as React from 'react';
import { useMounted } from '@/hooks/use-mounted';
import { Switch } from '@paykit-sdk/ui';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export const ToggleTheme = () => {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) return null;

  const isDark = theme === 'dark';

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4" />
      <Switch checked={isDark} onCheckedChange={handleToggle} />
      <Moon className="h-4 w-4" />
      <span className="sr-only">Toggle theme</span>
    </div>
  );
};
