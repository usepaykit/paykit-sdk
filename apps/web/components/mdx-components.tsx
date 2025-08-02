'use client';

import * as React from 'react';
import { CodeBlock } from '@/components/code-block';
import { cn } from '@/lib/utils';
import { Accordion, Button, Tabs, Card } from '@paykit-sdk/ui';
import { Alert } from '@paykit-sdk/ui';
import { useMDXComponent } from 'next-contentlayer/hooks';
import Link from 'next/link';

type MDXComponents = Parameters<ReturnType<typeof useMDXComponent>>['0']['components'];

function hasChildrenProp(props: unknown): props is { children: React.ReactNode } {
  return !!props && typeof props === 'object' && 'children' in props;
}

function extractCodeString(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractCodeString).join('');
  if (React.isValidElement(children)) {
    const el = children as React.ReactElement;
    if (hasChildrenProp(el.props)) {
      return extractCodeString(el.props.children);
    }
  }
  return '';
}

const components = {
  Accordion: Accordion.Root,
  AccordionContent: Accordion.Content,
  AccordionItem: Accordion.Item,
  AccordionTrigger: Accordion.Trigger,
  Alert: Alert.Root,
  AlertTitle: Alert.Title,
  AlertDescription: Alert.Description,
  Button: Button,
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn('font-heading mt-2 scroll-m-20 text-4xl font-bold', className)} {...props} />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn('font-heading mt-16 scroll-m-20 border-b pb-4 text-xl font-semibold tracking-tight first:mt-0', className)} {...props} />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('font-heading mt-8 scroll-m-20 text-lg font-semibold tracking-tight', className)} {...props} />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className={cn('font-heading mt-8 scroll-m-20 text-lg font-semibold tracking-tight', className)} {...props} />
  ),
  h5: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5 className={cn('mt-8 scroll-m-20 text-lg font-semibold tracking-tight', className)} {...props} />
  ),
  h6: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6 className={cn('mt-8 scroll-m-20 text-base font-semibold tracking-tight', className)} {...props} />
  ),
  a: ({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a className={cn('font-medium underline underline-offset-4', className)} {...props} />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('leading-[1.65rem] [&:not(:first-child)]:mt-6', className)} {...props} />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => <strong className={cn('font-semibold', className)} {...props} />,
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => <ul className={cn('my-6 ml-6 list-disc', className)} {...props} />,
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => <ol className={cn('my-6 ml-6 list-decimal', className)} {...props} />,
  li: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => <li className={cn('mt-2', className)} {...props} />,
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)} {...props} />
  ),
  img: ({ className, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cn('rounded-md', className)} alt={alt} {...props} />
  ),
  hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => <hr className="my-4 md:my-8" {...props} />,
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn('relative w-full overflow-hidden border-none text-sm', className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={cn('last:border-b-none m-0 border-b', className)} {...props} />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn('px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right', className)} {...props} />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn('px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right', className)} {...props} />
  ),
  Callout: ({ type, ...props }: React.HTMLAttributes<HTMLDivElement> & { type: 'warning' | 'info' }) => (
    <Alert.Root
      className={cn('my-6', {
        'bg-accent text-accent-foreground border-red-200 dark:border-red-200/30 dark:text-red-200': type === 'warning',
        'bg-accent text-accent-foreground border-blue-200 dark:border-blue-200/30 dark:text-blue-200': type === 'info',
      })}
      {...props}
    />
  ),
  Tabs: Tabs.Root,
  TabsList: Tabs.List,
  TabsTrigger: Tabs.Trigger,
  TabsContent: Tabs.Content,
  LinkedCard: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <Link href={href} className={cn('hover:text-foreground block transition-colors', className)}>
      <Card.Root className="group relative overflow-hidden transition-all hover:shadow-md">
        <Card.Content className="flex flex-col items-center justify-center p-6 text-center">{children}</Card.Content>
      </Card.Root>
    </Link>
  ),
  code: ({ className = '', children, ...props }) => {
    const isBlock = className && className.startsWith('language-');

    if (isBlock) {
      const language = className.replace('language-', '') || 'typescript';

      // Extract filename from the first line comment and remove it from display
      let filename = null;
      let codeString = extractCodeString(children);

      const firstLine = codeString.split('\n')[0];
      const commentMatch = firstLine.match(/^\/\/\s*(.+)$/) || firstLine.match(/^#\s*(.+)$/);

      if (commentMatch) {
        filename = commentMatch[1].trim();
        // Remove the first line (the comment) from the displayed code
        codeString = codeString.split('\n').slice(1).join('\n');
      }

      return (
        <CodeBlock
          className="mt-12 mb-6 w-full overflow-x-auto"
          customStyle={{ fontSize: '13px' }}
          language={language}
          filename={filename}
          showCopyButton={true}
          {...props}
        >
          {codeString}
        </CodeBlock>
      );
    }

    return (
      <code className={cn('bg-muted text-muted-foreground relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm', className)} {...props}>
        {children}
      </code>
    );
  },
} as MDXComponents;

interface MdxProps {
  code: string;
}

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code);

  return (
    <div className="mdx">
      <Component components={components} />
    </div>
  );
}
