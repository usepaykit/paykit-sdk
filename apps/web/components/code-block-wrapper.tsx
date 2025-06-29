import { cn } from '@/lib/utils';

export interface CodeBlockWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function CodeBlockWrapper({ children, className }: CodeBlockWrapperProps) {
  return <div className={cn('relative', className)}>{children}</div>;
}
