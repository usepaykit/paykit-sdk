import { useMounted } from '@/hooks/use-mounted';
import { OverrideProps } from '@paykit-sdk/core';
import { useTheme } from 'next-themes';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps extends OverrideProps<React.ComponentProps<typeof SyntaxHighlighter>, { language: string }> {}

export const CodeBlock = ({ language = '', children, ...props }: CodeBlockProps) => {
  const { resolvedTheme } = useTheme();

  const mounted = useMounted();

  const customStyle = {
    margin: 0,
    padding: 0,
    background: 'none',
    fontSize: '14px',
    lineHeight: '1.6',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
  };

  if (!mounted) return <div className="bg-muted/20 h-6 animate-pulse rounded" />;

  return (
    <SyntaxHighlighter
      language={language}
      style={resolvedTheme === 'dark' ? oneDark : oneLight}
      customStyle={{ ...customStyle, ...props.customStyle }}
      PreTag="pre"
      showLineNumbers={false}
      wrapLines={false}
      {...props}
    >
      {children}
    </SyntaxHighlighter>
  );
};
