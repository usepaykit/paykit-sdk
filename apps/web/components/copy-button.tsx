'use client';

import * as React from 'react';
import { Button, cn } from '@paykit-sdk/ui';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
  src?: string;
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn('relative z-10 size-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50', className)}
      onClick={() => {
        navigator.clipboard.writeText(value);
        setHasCopied(true);
      }}
      {...props}
    >
      <span className="sr-only">Copy</span>
      {hasCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </Button>
  );
}
