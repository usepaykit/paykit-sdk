'use client';

import * as React from 'react';
import { DocsSidebarNav } from '@/config/docs';
import { cn } from '@paykit-sdk/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DocsNavProps {
  config: { sidebarNav: DocsSidebarNav[] };
}

export function DocsNav({ config }: DocsNavProps) {
  const pathname = usePathname();

  return (
    <div className="no-scrollbar h-[calc(100vh-8rem)] overflow-auto pb-1 pl-8">
      <div className="space-y-6">
        {config.sidebarNav.map((group, index) => (
          <div key={index} className="space-y-3">
            <h4 className="text-foreground/80 text-sm font-semibold tracking-wider uppercase">
              {group.title}
            </h4>
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
                    <div
                      key={index}
                      className="text-muted-foreground px-3 py-1 text-sm font-medium"
                    >
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
  );
}
