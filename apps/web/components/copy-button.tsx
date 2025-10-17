'use client';

import * as React from 'react';
import { Button, Toast } from '@paykit-sdk/ui';

interface CopyButtonProps extends React.ComponentProps<typeof Button> {
  value: string;
}

export function CopyButton({ value, ...props }: CopyButtonProps) {
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
    />
  );
}
