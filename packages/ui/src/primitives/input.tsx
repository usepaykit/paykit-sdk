import * as React from 'react';
import { cn } from '../lib/utils';

interface RootProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Root = React.forwardRef<HTMLInputElement, RootProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'border-input bg-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/40 flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

export { Root as Input };

Root.displayName = 'Input';
