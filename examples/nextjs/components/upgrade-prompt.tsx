'use client';

import { useCheckout } from '@paykit-sdk/react';
import { Button, Badge, Card } from '@paykit-sdk/ui';
import { Crown, Zap, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  feature: string;
  currentPlan: string;
}

const customerId = '945dcda1-5c77-42e4-aa4b-2ab945851032';
const itemId = '66738d4f-6d66-47c7-8acb-0f30a1bb15da';

export function UpgradePrompt({ feature, currentPlan }: UpgradePromptProps) {
  const { create } = useCheckout();

  const router = useRouter();

  const handleUpgrade = async () => {
    const { data, error } = await create.run({
      customer_id: customerId,
      item_id: itemId,
      session_type: 'recurring',
      metadata: { plan: 'pro', billing: 'monthly' },
      provider_metadata: { successUrl: `http://localhost:3000/payment-success` },
    });

    if (error) throw new Error(error.message);

    router.push(data.payment_url);
  };

  return (
    <Card.Root className="border-primary/20 bg-primary/5 border-2 border-dashed">
      <Card.Header className="text-center">
        <div className="bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
          <Crown className="text-primary h-6 w-6" />
        </div>
        <Card.Title className="font-outfit text-xl">Upgrade Required</Card.Title>
        <Card.Description>You've reached the limit for {feature} on your current plan</Card.Description>
      </Card.Header>
      <Card.Content className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary">Current: {currentPlan}</Badge>
          <ArrowRight className="text-muted-foreground h-4 w-4" />
          <Badge className="bg-primary text-primary-foreground">
            <Zap className="mr-1 h-3 w-3" />
            Pro Plan
          </Badge>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">Upgrade to Pro and get:</p>
          <ul className="space-y-1 text-sm">
            <li>• 50 AI generations per month</li>
            <li>• Unlimited tasks</li>
            <li>• Advanced templates</li>
            <li>• Priority support</li>
          </ul>
        </div>

        <Button className="w-full" onClick={handleUpgrade}>
          <Crown className="mr-2 h-4 w-4" />
          Upgrade to Pro
        </Button>
      </Card.Content>
    </Card.Root>
  );
}
