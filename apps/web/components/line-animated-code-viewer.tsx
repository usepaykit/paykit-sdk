'use client';

import * as React from 'react';
import { cn } from '@paykit-sdk/ui';
import { CodeBlock } from './code-block';

interface LineAnimatedCodeViewerProps {
  className?: string;
  lines?: string[];
}

interface AnimatedLineProps {
  content: string;
  isChangingLine: boolean;
}

const AnimatedLine = ({ content, isChangingLine }: AnimatedLineProps) => {
  const [currentContent, setCurrentContent] = React.useState(content);
  const [isAnimating, setIsAnimating] = React.useState(false);

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

  if (currentContent === '') return <div className="h-4" />;

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-in-out',
        isChangingLine && isAnimating
          ? 'translate-x-1 opacity-30'
          : 'translate-x-0 opacity-100',
        isChangingLine
          ? 'bg-primary/5 border-primary/50 my-0.5 -ml-3 rounded-r border-l-2 pl-3'
          : '',
      )}
    >
      <div className="[&_*]:!bg-transparent">
        <CodeBlock
          language="typescript"
          customStyle={{
            padding: 0,
            background: 'none',
            fontSize: '14px',
            border: 'none',
          }}
        >
          {currentContent}
        </CodeBlock>
      </div>
    </div>
  );
};

export function LineAnimatedCodeViewer({
  className = '',
  lines = [],
}: LineAnimatedCodeViewerProps) {
  return (
    <div
      className={cn('bg-card border-border overflow-hidden rounded-lg border', className)}
    >
      <div className="overflow-x-auto">
        <div className="min-w-max p-6">
          {lines.map((line, index) => {
            // Only lines 1 and 3 (import and provider init) should be marked as changing
            const isChangingLine = index === 1 || index === 3;

            return (
              <AnimatedLine key={index} content={line} isChangingLine={isChangingLine} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
