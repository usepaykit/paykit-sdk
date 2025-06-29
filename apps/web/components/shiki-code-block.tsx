import React from 'react';
import { createHighlighter } from 'shiki';

interface ShikiCodeBlockProps {
  code: string;
  language: string;
}

export default async function ShikiCodeBlock({ code, language }: ShikiCodeBlockProps) {
  const highlighter = await createHighlighter({
    themes: ['github-dark'],
    langs: ['typescript', 'javascript', 'bash', 'json', 'css', 'python', 'tsx', 'ts', 'js'],
  });
  const html = highlighter.codeToHtml(code, {
    lang: language || 'text',
    theme: 'github-dark',
  });
  return (
    <div
      className="shiki-codeblock"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
} 