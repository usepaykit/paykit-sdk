'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaykitMetadata, safeEncode, Subscription, type Checkout } from '@paykit-sdk/core';
import { Button, Input, Toast } from '@paykit-sdk/ui';
import { Lock, CreditCard } from 'lucide-react';
import { nanoid } from 'nanoid';
import * as RHF from 'react-hook-form';
import { z } from 'zod';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Spinner = () => <div className="animate-rounded size-6" />;

const formSchema = z.object({
  cardNumber: z.string().min(16, { message: 'Card number must be 16 digits' }),
});

type CheckoutFormSchema = z.infer<typeof formSchema>;

interface CheckoutCardProps extends Checkout {
  provider_metadata: PaykitMetadata;
  referer?: string | null;
}

export const CheckoutCard = ({ amount, metadata, session_type, provider_metadata, referer, ...rest }: CheckoutCardProps) => {
  const customerName = provider_metadata?.customerName;
  const customerEmail = provider_metadata?.customerEmail;
  const webhookUrl = provider_metadata?.webhookUrl;
  const productName = provider_metadata?.productName;

  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);

  const form = RHF.useForm<CheckoutFormSchema>({ resolver: zodResolver(formSchema) });

  const onSubmit = async () => {
    try {
      setIsProcessing(true);

      if (!webhookUrl) throw new Error('API URL is not set in local provider initialization');

      const makeWebhookUrl = (dto: { type: string; body: Record<string, unknown>; resource: string }) => {
        const urlParams = new URLSearchParams({ resource: dto.resource, type: dto.type, body: JSON.stringify(dto.body), webhookUrl: webhookUrl });
        return `/api/webhook?${urlParams.toString()}`;
      };

      console.log('Webhook URL:', webhookUrl);

      const paymentId = safeEncode({ ...rest, amount, metadata, session_type, completed_at: new Date().toISOString(), source: 'cli-app' });

      if (!paymentId.ok) throw new Error('Failed to generate payment ID');

      const paymentSuccess = await fetch(makeWebhookUrl({ type: '$paymentReceived', body: { id: paymentId.value }, resource: 'payment' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      });

      if (!paymentSuccess.ok) throw new Error('Failed to process payment');

      if (session_type === 'recurring') {
        await delay(2000);

        const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const subscriptionWithoutId = {
          customer_id: rest.customer_id,
          status: 'active',
          current_period_start: new Date(),
          current_period_end: in30Days,
          metadata: metadata,
        } as Omit<Subscription, 'id'>;

        const subscriptionCreated = await fetch(
          makeWebhookUrl({ type: '$subscriptionCreated', body: { id: `sub_${nanoid(30)}`, ...subscriptionWithoutId }, resource: 'subscription' }),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          },
        );

        if (!subscriptionCreated.ok) throw new Error('Failed to create subscription');
      }

      Toast.success({ title: 'Success', description: 'Payment processed successfully 🎉' });

      if (referer) setTimeout(() => (window.location.href = `${referer}?success=true`), 2000);
    } catch (error) {
      Toast.error({ title: 'Error', description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="mx-auto max-w-2xl md:max-w-4xl lg:max-w-5xl">
        {/* Main Checkout Card */}
        <div className="bg-background rounded-lg border p-0">
          <div className="grid gap-8 p-6 md:grid-cols-2 md:p-10">
            {/* Left: Form */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-left text-2xl font-bold">Secure Checkout</h2>
                <p className="text-muted-foreground mb-4 text-left text-sm">Powered by PayKit Local Provider</p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Info */}
                <div className="bg-muted/30 mb-4 rounded-lg border p-4">
                  <div className="mb-2 text-left text-xs font-medium">Customer Information</div>
                  <div className="space-y-2">
                    <Input type="email" value={customerEmail} disabled className="bg-background text-muted-foreground h-8 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="text"
                        value={customerName ? customerName.split(' ')[0] : 'John'}
                        disabled
                        className="bg-background text-muted-foreground h-8 text-sm"
                      />
                      <Input
                        type="text"
                        value={customerName ? customerName.split(' ').slice(1).join(' ') || 'Doe' : 'Doe'}
                        disabled
                        className="bg-background text-muted-foreground h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <RHF.Controller
                  control={form.control}
                  name="cardNumber"
                  render={({ field, fieldState: { error } }) => (
                    <div className="bg-muted/30 rounded-lg border p-4">
                      <div className="mb-2 text-left text-xs font-medium">Payment Method</div>
                      <Input
                        {...field}
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        className="bg-background text-center font-mono text-base tracking-widest"
                      />
                      {error && <p className="mt-2 text-xs text-red-400">{error.message}</p>}
                    </div>
                  )}
                />

                <Button type="submit" disabled={isProcessing} size="lg" className="mt-4 w-full">
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <Spinner />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Lock className="mr-2 h-4 w-4" />
                      <span className="ml-2">Complete Payment - {amount}</span>
                    </div>
                  )}
                </Button>
              </form>
            </div>

            {/* Right: Order Summary */}
            <div className="bg-muted/30 flex min-h-[340px] flex-col justify-between rounded-lg border p-6">
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Order Summary</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 text-sm">
                    <span className="font-medium">{productName}</span>
                    <span className="font-medium">{amount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span>Local provider fee</span>
                  <span className="text-green-600 dark:text-green-400">$0.00</span>
                </div>
                <div className="my-4 border-t"></div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{amount}</span>
                </div>
              </div>
              <div className="pt-6">
                <Button onClick={form.handleSubmit(onSubmit)} disabled={isProcessing} size="lg" className="w-full">
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <Spinner />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Complete Payment - {amount}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
