'use client';

import * as React from 'react';
import { OverrideProps } from '@paykit-sdk/core';
import { Button, Toast } from '@paykit-sdk/ui';

type CopyButtonProps = OverrideProps<
  Omit<React.ComponentProps<typeof Button>, 'onClick'>,
  { value: string }
>;

export function CopyButton({ value, children, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <Button
      variant="ghost"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setHasCopied(true);
        Toast.success({
          title: 'Copied to clipboard',
          options: {
            duration: 4000,
            position: 'bottom-right',
            className: 'font-pt-sans',
          },
        });
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
