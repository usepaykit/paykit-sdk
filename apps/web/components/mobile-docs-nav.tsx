'use client';

import * as React from 'react';
import { DocsSidebarNav } from '@/config/docs';
import { cn } from '@paykit-sdk/ui';
import { Sheet } from '@paykit-sdk/ui';
import { Button } from '@paykit-sdk/ui';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileDocsNavProps {
  config: { sidebarNav: DocsSidebarNav[] };
}

export function MobileDocsNav({ config }: MobileDocsNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Close sheet when navigating to a new page
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet.Root open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden" aria-label="Open navigation menu">
          <Menu className="h-5 w-5" />
        </Button>
      </Sheet.Trigger>
      <Sheet.Content side="left" className="w-80 p-0">
        <Sheet.Header className="p-6 pb-4">
          <Sheet.Title className="text-left">Documentation</Sheet.Title>
        </Sheet.Header>
        <div className="h-[calc(100vh-8rem)] overflow-auto px-6 pb-6">
          <div className="space-y-6">
            {config.sidebarNav.map((group, index) => (
              <div key={index} className="space-y-3">
                <h4 className="text-foreground/80 text-sm font-semibold tracking-wider uppercase">{group.title}</h4>
                {group.items?.length && (
                  <div className="space-y-1">
                    {group.items.map((item, index) =>
                      item.href ? (
                        <Link
                          key={index}
                          href={item.href}
                          className={cn(
                            'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                            item.href === pathname
                              ? 'bg-primary/10 text-primary border-primary border-r-2 font-semibold'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                          )}
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <div key={index} className="text-muted-foreground px-3 py-1 text-sm font-medium">
                          {item.title}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Sheet.Content>
    </Sheet.Root>
  );
}
