'use client';

import * as React from 'react';
import { DocsSidebarNav } from '@/config/docs';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DocsNavProps {
  config: { sidebarNav: DocsSidebarNav[] };
}

export function DocsNav({ config }: DocsNavProps) {
  const pathname = usePathname();

  return (
    <div className="h-[calc(100vh-8rem)] pb-1 pl-8 no-scrollbar overflow-auto">
      <div className="space-y-6">
        {config.sidebarNav.map((group, index) => (
          <div key={index} className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
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
                        'block w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                        item.href === pathname 
                          ? 'bg-primary/10 text-primary border-r-2 border-primary font-semibold' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <div key={index} className="px-3 py-1 text-sm font-medium text-muted-foreground">
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
