import { useMounted } from '@/hooks/use-mounted';
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
  [key: string]: any;
}

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
    <TypedSyntaxHighlighter
      language={language}
      style={resolvedTheme === 'dark' ? oneDark : oneLight}
      customStyle={{ ...customStyle, ...props.customStyle }}
      PreTag="pre"
      showLineNumbers={false}
      wrapLines={false}
      {...props}
    >
      {children}
    </TypedSyntaxHighlighter>
  );
};
