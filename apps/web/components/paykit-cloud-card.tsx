import { useCheckout } from '@paykit-sdk/react';
import { Button, Card, Toast } from '@paykit-sdk/ui';
import { useRouter } from 'next/router';

export function PayKitCloudCard() {
  const { create } = useCheckout();
  const router = useRouter();

  const handleCheckout = async () => {
    if (create.loading) return;

    const { data, error } = await create.run({
      customer_id: 'cus_123',
      item_id: 'price_123',
      session_type: 'one_time',
      metadata: { plan: 'cloud' },
      provider_metadata: {
        successUrl: 'https://usepaykit.dev/payment-success',
      },
    });

    if (error) {
      Toast.error({ title: 'Error', description: error.message });
      return;
    }

    router.push(data.payment_url);
  };

  return (
    <Card.Root className="border-border/50 bg-card/50 cursor-pointer" onClick={handleCheckout}>
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
  );
}
