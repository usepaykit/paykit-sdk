import { DocsNav } from '@/components/docs-nav';
import { MobileDocsNav } from '@/components/mobile-docs-nav';
import { SiteHeader } from '@/components/site-header';
import { docsConfig } from '@/config/docs';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div
      className={cn(
        'font-pt-sans bg-background text-foreground min-h-screen antialiased',
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
          <SiteHeader />
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
