'use client';

import * as React from 'react';
import { DashboardTableOfContents } from '@/components/toc';
import { Toc } from '@/lib/toc';
import { Sheet, Button } from '@paykit-sdk/ui';
import { List } from 'lucide-react';

interface MobileTocProps {
  toc: Toc;
}

export function MobileToc({ toc }: MobileTocProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet.Root open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          aria-label="Open table of contents"
        >
          <List className="h-5 w-5" />
        </Button>
      </Sheet.Trigger>
      <Sheet.Content side="right" className="w-80 p-0">
        <Sheet.Header className="p-6 pb-4">
          <Sheet.Title className="text-left">On this page</Sheet.Title>
        </Sheet.Header>
        <div className="h-[calc(100vh-8rem)] overflow-auto px-6 pb-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <DashboardTableOfContents toc={toc} />
            </div>
          </div>
        </div>
      </Sheet.Content>
    </Sheet.Root>
  );
}
