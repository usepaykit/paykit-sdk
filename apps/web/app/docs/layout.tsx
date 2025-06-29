import { DocsNav } from '@/components/docs-nav';
import { docsConfig } from '@/config/docs';

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      <div className="flex w-full">
        <aside className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r backdrop-blur md:sticky md:block">
          <div className="h-full overflow-auto py-6 pr-4 lg:py-8">
            <DocsNav config={docsConfig} />
          </div>
        </aside>
        <main className="flex-1 md:ml-64">{children}</main>
      </div>
    </div>
  );
}
