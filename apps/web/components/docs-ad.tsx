'use client';

import { checkoutUrl } from '@/lib/checkout';
import { Button, Card } from '@paykit-sdk/ui';
import Link from 'next/link';

export const DocsAd = () => {
  return (
    <Link target="_blank" href={checkoutUrl}>
      <Card.Root className="border-border/50 bg-card/50 cursor-pointer">
        <Card.Header className="pb-3">
          <Card.Title className="text-lg font-semibold">Get PayKit Cloud Lifetime Access</Card.Title>
          <Card.Description className="text-muted-foreground text-sm">
            Launching in v2. Deploy your payment infrastructure with confidence.
          </Card.Description>
        </Card.Header>
        <Card.Content className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Never break your MRR streak when switching providers. Platform integrations with Supabase, Vercel, and more.
          </p>
          <Button className="w-full" size="sm">
            Get Lifetime Access - $99
          </Button>
        </Card.Content>
      </Card.Root>
    </Link>
  );
};
