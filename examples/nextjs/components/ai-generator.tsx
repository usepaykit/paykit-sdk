'use client';

import { useState } from 'react';
import { generateContent } from '@/lib/mock-functions';
import { Button, Textarea, Card, Toast } from '@paykit-sdk/ui';
import { Sparkles, Copy, RefreshCw } from 'lucide-react';

interface AIGeneratorProps {
  onGenerated: (content: string) => void;
  placeholder?: string;
}

export function AIGenerator({ onGenerated, placeholder = 'Describe what you want to generate...' }: AIGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return Toast.error({ title: 'Please enter a prompt' });
    }

    setLoading(true);
    try {
      const result = await generateContent(prompt);
      setGeneratedContent(result.content);
      return Toast.success({ title: 'Content generated successfully!' });
    } catch (error) {
      return Toast.error({ title: 'Failed to generate content' });
    } finally {
      setLoading(false);
    }
  };

  const handleUseContent = () => {
    onGenerated(generatedContent);
    return Toast.success({ title: 'Content applied!' });
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      return Toast.success({ title: 'Content copied to clipboard!' });
    } catch (error) {
      return Toast.error({ title: 'Failed to copy content' });
    }
  };

  return (
    <Card.Root className="w-full">
      <Card.Header>
        <Card.Title className="font-outfit flex items-center gap-2">
          <Sparkles className="text-primary h-5 w-5" />
          AI Content Generator
        </Card.Title>
        <Card.Description>Describe what you want to generate and let AI create content for you</Card.Description>
      </Card.Header>
      <Card.Content className="space-y-4">
        <div className="space-y-2">
          <Textarea placeholder={placeholder} value={prompt} onChange={e => setPrompt(e.target.value)} className="min-h-[100px]" />
          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="w-full">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </div>

        {generatedContent && (
          <div className="bg-muted/50 space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-outfit font-medium">Generated Content</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyContent}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleUseContent}>
                  Use This Content
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{generatedContent}</p>
          </div>
        )}
      </Card.Content>
    </Card.Root>
  );
}
