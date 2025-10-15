'use client';

import { useState } from 'react';
import { Button } from '@paykit-sdk/ui';
import { Copy, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeEditorProps {
  code: string;
  language?: string;
  showCopyButton?: boolean;
  highlightLines?: number[];
  className?: string;
}

/**
 * @description Type assertion to fix React 19 compatibility
 */
const TypedSyntaxHighlighter = SyntaxHighlighter as any;

export function CodeEditor({
  code,
  language = 'typescript',
  showCopyButton = true,
  highlightLines = [],
  className = '',
}: CodeEditorProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const customStyle = {
    margin: 0,
    padding: '1.5rem',
    background: 'hsl(var(--card))',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    borderRadius: 'calc(var(--radius) + 2px)',
    border: '1px solid hsl(var(--border))',
  };

  const lineProps = (lineNumber: number) => {
    const isHighlighted = highlightLines.includes(lineNumber);
    return {
      style: {
        backgroundColor: isHighlighted ? 'hsl(var(--primary) / 0.1)' : 'transparent',
        borderLeft: isHighlighted ? '3px solid hsl(var(--primary))' : '3px solid transparent',
        paddingLeft: '0.75rem',
        marginLeft: '-0.75rem',
        display: 'block',
      },
    };
  };

  return (
    <div className={`group relative ${className}`}>
      {showCopyButton && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="absolute top-3 right-3 z-10 opacity-0 transition-opacity group-hover:opacity-100"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}

      <TypedSyntaxHighlighter
        language={language}
        style={theme === 'dark' ? oneDark : oneLight}
        customStyle={customStyle}
        showLineNumbers
        lineProps={lineProps}
        wrapLines
      >
        {code}
      </TypedSyntaxHighlighter>
    </div>
  );
}
