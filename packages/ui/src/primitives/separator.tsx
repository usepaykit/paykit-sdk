'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '../lib/utils';

type RootProps = React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>;

const Root = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  RootProps
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      {...props}
    />
  );
});

Root.displayName = 'Separator';

export { Root as Separator };
