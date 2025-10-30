'use client';

import { Button } from '@paykit-sdk/ui';
import { BookOpen, Github, History, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export const SiteHeader = () => {
  return (
    <div className="flex items-center space-x-1">
      <Button asChild variant="ghost" size="sm">
        <Link href="/docs">
          <BookOpen className="size-4" />
        </Link>
      </Button>

      <Button asChild variant="ghost" size="sm">
        <Link
          href="https://github.com/usepaykit"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github className="size-4" />
        </Link>
      </Button>

      <Button asChild variant="ghost" size="sm">
        <Link href="/changelog">
          <History className="size-4" />
        </Link>
      </Button>

      <Button asChild variant="ghost" size="sm">
        <Link href="https://x.com/usepaykit" target="_blank" rel="noopener noreferrer">
          <svg
            className="size-4"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <title>X</title>
            <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
          </svg>
        </Link>
      </Button>

      <Button asChild variant="ghost" size="sm">
        <Link
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          title="Discord coming soon"
        >
          <MessageCircle className="size-4" />
        </Link>
      </Button>
      <ThemeToggle />
    </div>
  );
};
