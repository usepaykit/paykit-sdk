'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Zap, CreditCard } from 'lucide-react';

interface CheckoutCardProps {
  name: string;
  price: string;
}

export function CheckoutCard({ name, price }: CheckoutCardProps) {
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [cardNumber, setCardNumber] = React.useState<string>('');

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');

    // Limit to 16 digits
    const limitedDigits = digitsOnly.slice(0, 16);

    // Add spaces after every 4 digits
    const formatted = limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');

    return formatted;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      alert('Payment processed successfully with PayKit Local Provider! 🎉');
    }, 2000);
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

              {/* Customer Info (static for demo) */}
              <div className="bg-muted/30 mb-4 rounded-lg border p-4">
                <div className="mb-2 text-left text-xs font-medium">Customer Information</div>
                <div className="space-y-2">
                  <div className="bg-background text-muted-foreground flex h-8 items-center rounded border px-3 py-1 text-sm">john@example.com</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-background text-muted-foreground flex h-8 items-center rounded border px-3 py-1 text-sm">John</div>
                    <div className="bg-background text-muted-foreground flex h-8 items-center rounded border px-3 py-1 text-sm">Doe</div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="mb-2 text-left text-xs font-medium">Payment Method</div>
                <Input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  className="bg-background text-center font-mono text-base tracking-widest"
                />
                <p className="text-muted-foreground mt-2 text-xs">Use test card: 4242 4242 4242 4242</p>
              </div>

              <Button onClick={handleCheckout} disabled={isProcessing || !cardNumber.trim()} size="lg" className="mt-4 w-full">
                {isProcessing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Complete Payment - {price}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center pt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <Zap className="mr-1 h-3 w-3" />
                  Local Provider Active
                </Badge>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="bg-muted/30 flex min-h-[340px] flex-col justify-between rounded-lg border p-6">
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Order Summary</h3>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span>{name}</span>
                  <span className="font-medium">{price}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span>Local provider fee</span>
                  <span className="text-green-600 dark:text-green-400">$0.00</span>
                </div>
                <div className="my-4 border-t"></div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{price}</span>
                </div>
              </div>
              <div className="pt-6">
                <Button onClick={handleCheckout} disabled={isProcessing || !cardNumber.trim()} size="lg" className="w-full">
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Complete Payment - {price}
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
}
