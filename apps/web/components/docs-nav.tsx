'use client';

import * as React from 'react';
import { buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
      <div className="grid grid-flow-row auto-rows-max text-sm">
        {config.sidebarNav.map((group, index) => (
          <div key={index} className="grid grid-flow-row auto-rows-max">
            <h4 className="my-4 text-lg font-medium">{group.title}</h4>
            {group.items?.length && (
              <div className="grid grid-flow-row auto-rows-max text-sm">
                {group.items.map((item, index) =>
                  item.href ? (
                    <Link
                      key={index}
                      href={item.href}
                      className={cn(
                        buttonVariants({ variant: 'ghost' }),
                        item.href === pathname ? 'bg-muted font-medium' : 'not-italic',
                        'justify-start',
                      )}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  ),
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
