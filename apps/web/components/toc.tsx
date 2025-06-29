'use client';

import * as React from 'react';
import { buttonVariants } from '@/components/ui/button';
import { type Toc } from '@/lib/toc';
import { cn } from '@/lib/utils';

interface DashboardTableOfContentsProps {
  toc: Toc;
}

export function DashboardTableOfContents({ toc }: DashboardTableOfContentsProps) {
  const itemIds = React.useMemo(
    () =>
      toc
        .flatMap(item => [item.id, item?.children?.map(item => item.id)])
        .filter(Boolean)
        .flat() as string[],
    [toc],
  );
  const activeHeading = useActiveItem(itemIds);

  if (!toc?.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Tree tree={toc} activeItem={activeHeading} />
    </div>
  );
}

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string>('');

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: `0% 0% -80% 0%` },
    );

    itemIds?.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      itemIds?.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [itemIds]);

  return activeId;
}

interface TreeProps {
  tree: Toc;
  level?: number;
  activeItem?: string;
}

function Tree({ tree, level = 1, activeItem }: TreeProps) {
  return tree?.length && level < 3 ? (
    <ul className={cn('m-0 list-none space-y-1', { 'pl-4 border-l border-border/50': level !== 1 })}>
      {tree.map((item, index) => {
        return (
          <li key={index}>
            <a
              href={`#${item.id}`}
              className={cn(
                'block text-sm transition-colors hover:text-foreground',
                item.id === activeItem 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground',
                level === 1 ? 'py-1' : 'py-0.5 text-xs'
              )}
            >
              {item.title}
            </a>
            {item.children?.length && <Tree tree={item.children} level={level + 1} activeItem={activeItem} />}
          </li>
        );
      })}
    </ul>
  ) : null;
}
