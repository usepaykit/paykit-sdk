'use client';

import { useState } from 'react';
import { useMounted } from '@/hooks/use-mounted';
import { Button, Tooltip } from '@paykit-sdk/ui';
import { Check, Copy } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * @description Type assertion to fix React 19 compatibility
 */
const TypedSyntaxHighlighter = SyntaxHighlighter as any;

interface CodeBlockProps {
  language?: string;
  children: string;
  customStyle?: React.CSSProperties;
  componentName?: string | null;
  showCopyButton?: boolean;
  filename?: string;
  [key: string]: any;
}

// Language to icon mapping
const getLanguageIcon = (language: string) => {
  switch (language.toLowerCase()) {
    case 'typescript':
    case 'ts':
    case 'tsx':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
        </svg>
      );
    case 'javascript':
    case 'js':
    case 'jsx':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248L8.2 18.38h2.248l1.651-7.349z" />
        </svg>
      );
    case 'json':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24">
          <path
            d="M25 20 Q15 20 15 30 L15 35 Q15 40 10 40 Q15 40 15 45 L15 50 Q15 60 25 60 Q20 60 20 55 L20 50 Q20 45 15 45 Q20 45 20 40 L20 35 Q20 30 25 30 Q25 25 25 20 Z"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path
            d="M75 20 Q85 20 85 30 L85 35 Q85 40 90 40 Q85 40 85 45 L85 50 Q85 60 75 60 Q80 60 80 55 L80 50 Q80 45 85 45 Q80 45 80 40 L80 35 Q80 30 75 30 Q75 25 75 20 Z"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </svg>
      );
    case 'bash':
    case 'shell':
    case 'sh':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="h-4 w-4"
        >
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" x2="20" y1="19" y2="19"></line>
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
        </svg>
      );
  }
};

function CodeBlockContent({ language = '', children, customStyle, filename, ...props }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();

  const customStyleObj = {
    margin: 0,
    padding: '16px',
    background: resolvedTheme === 'dark' ? '#0f0f0f' : '#fafafa',
    fontSize: '14px',
    lineHeight: '1.6',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
    borderRadius: '0 0 8px 8px',
    border: 'none',
    ...customStyle,
  };

  // Apply muted styling for bash
  if (language === 'bash') {
    customStyleObj.background = resolvedTheme === 'dark' ? '#1f1f1f' : '#f5f5f5';
    customStyleObj.color = resolvedTheme === 'dark' ? '#a1a1aa' : '#71717a';
  }

  const theme =
    resolvedTheme === 'dark'
      ? {
          ...oneDark,
          'pre[class*="language-"]': { ...oneDark['pre[class*="language-"]'], background: '#0f0f0f', margin: 0, borderRadius: '0 0 8px 8px' },
          'code[class*="language-"]': { ...oneDark['code[class*="language-"]'], background: '#0f0f0f' },
        }
      : {
          ...oneLight,
          'pre[class*="language-"]': { ...oneLight['pre[class*="language-"]'], background: '#fafafa', margin: 0, borderRadius: '0 0 8px 8px' },
          'code[class*="language-"]': { ...oneLight['code[class*="language-"]'], background: '#fafafa' },
        };

  // Override theme for bash
  if (language === 'bash') {
    theme['pre[class*="language-"]'].background = resolvedTheme === 'dark' ? '#1f1f1f' : '#f5f5f5';
    theme['code[class*="language-"]'].background = resolvedTheme === 'dark' ? '#1f1f1f' : '#f5f5f5';
  }

  return (
    <TypedSyntaxHighlighter
      language={language}
      style={theme}
      customStyle={customStyleObj}
      PreTag="pre"
      showLineNumbers={false}
      wrapLines={false}
      {...props}
    >
      {children}
    </TypedSyntaxHighlighter>
  );
}

export const CodeBlock = ({ showCopyButton = false, children, filename, ...props }: CodeBlockProps) => {
  const mounted = useMounted();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 10000); // 10 seconds
  };

  if (!mounted) return <div className="bg-muted/20 h-6 animate-pulse rounded" />;

  if (!showCopyButton && !filename) {
    return <CodeBlockContent {...props}>{children}</CodeBlockContent>;
  }

  return (
    <div className="group bg-muted relative flex flex-col items-center justify-between rounded-xl">
      <div className="flex w-full items-center justify-between px-2 py-1">
        {filename ? (
          <div className="flex items-center space-x-2">
            {getLanguageIcon(props.language || '')}
            <span className="text-sm font-medium">{filename}</span>
          </div>
        ) : (
          <div />
        )}

        {showCopyButton && (
          <Tooltip.Root>
            <Tooltip.Trigger className="max-h-8">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 transition-opacity" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy code</span>
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content side="top" className="">
              {copied ? 'Copied to clipboard' : 'Copy to clipboard'}
            </Tooltip.Content>
          </Tooltip.Root>
        )}
      </div>

      <CodeBlockContent {...props}>{children}</CodeBlockContent>
    </div>
  );
};
