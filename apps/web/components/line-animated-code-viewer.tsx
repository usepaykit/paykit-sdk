'use client';

import * as React from 'react';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface LineAnimatedCodeViewerProps {
  provider: string;
  className?: string;
}

const getCodeLines = (provider: string) => [
  "import { PayKit } from '@paykit-sdk/core';",
  `import { ${provider} } from '@paykit-sdk/${provider}';`,
  '',
  `const provider = ${provider}();`,
  'const paykit = new PayKit(provider);',
  '',
  'const customer = await paykit.customers.create({',
  "  email: 'customer@example.com',",
  '});',
  '',
  'const checkout = await paykit.checkouts.create({',
  '  customer_id: customer.id,',
  "  metadata: { order_id: '123' },",
  "  session_type: 'one_time',",
  "  item_id: 'price_123',",
  '});',
];

interface AnimatedLineProps {
  content: string;
  isChangingLine: boolean;
}

function AnimatedLine({ content, isChangingLine }: AnimatedLineProps) {
  const { theme, resolvedTheme } = useTheme();
  const [currentContent, setCurrentContent] = React.useState(content);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const mounted = useMounted();

  React.useEffect(() => {
    if (content !== currentContent) {
      if (isChangingLine) {
        setIsAnimating(true);

        // Animate out old content
        const timer = setTimeout(() => {
          setCurrentContent(content);
          setIsAnimating(false);
        }, 200);

        return () => clearTimeout(timer);
      } else {
        // For non-changing lines, update immediately
        setCurrentContent(content);
      }
    }
  }, [content, currentContent, isChangingLine]);

  const customStyle = {
    margin: 0,
    padding: 0,
    background: 'hsl(var(--card))',
    fontSize: '14px',
    lineHeight: '1.6',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
  };

  // Empty lines should just be spacing
  if (currentContent === '') {
    return <div className="h-4" />;
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="bg-muted/20 h-6 animate-pulse rounded" />;
  }

  // Use resolvedTheme for more reliable theme detection
  const isDark = resolvedTheme === 'dark' || theme === 'dark';

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-in-out',
        isChangingLine && isAnimating ? 'translate-x-1 opacity-30' : 'translate-x-0 opacity-100',
        isChangingLine ? 'bg-primary/5 border-primary/50 my-0.5 -ml-3 rounded-r border-l-2 pl-3' : '',
      )}
    >
      <div className="[&_*]:!bg-transparent">
        <SyntaxHighlighter
          language="typescript"
          style={isDark ? oneDark : oneLight}
          customStyle={customStyle}
          PreTag="span"
          showLineNumbers={false}
          wrapLines={false}
        >
          {currentContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export function LineAnimatedCodeViewer({ provider, className = '' }: LineAnimatedCodeViewerProps) {
  const codeLines = getCodeLines(provider);

  return (
    <div className={cn('bg-card border-border overflow-hidden rounded-lg border', className)}>
      <div className="p-6">
        {codeLines.map((line, index) => {
          // Only lines 1 and 3 (import and provider init) should be marked as changing
          const isChangingLine = index === 1 || index === 3;

          return <AnimatedLine key={index} content={line} isChangingLine={isChangingLine} />;
        })}
      </div>
    </div>
  );
}
