import { DocsNav } from '@/components/docs-nav';
import { MobileDocsNav } from '@/components/mobile-docs-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { docsConfig } from '@/config/docs';
import { cn } from '@/lib/utils';
import { Button } from '@paykit-sdk/ui';
import { Github, MessageCircle } from 'lucide-react';
import { Geist_Mono } from 'next/font/google';
import Link from 'next/link';

// Twitter/X Icon component
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  weight: ['400', '700'],
});

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div
      className={cn(
        geistMono.variable,
        'font-geist-mono bg-background text-foreground min-h-screen antialiased',
      )}
    >
      <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="block md:hidden!">
              <MobileDocsNav config={docsConfig} />
            </div>
            <h1 className="text-xl font-bold">
              <Link href="/">PayKit Docs</Link>
            </h1>
          </div>
          <div className="flex items-center space-x-1">
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
              <Link
                href="https://x.com/usepaykit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon className="size-4" />
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
        </div>
      </header>

      <div className="flex w-full">
        <aside className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r backdrop-blur md:sticky md:block!">
          <div className="h-full overflow-auto py-6 pr-4 lg:py-8">
            <DocsNav config={docsConfig} />
          </div>
        </aside>
        <main className="flex-1 md:ml-64">{children}</main>
      </div>
    </div>
  );
}
