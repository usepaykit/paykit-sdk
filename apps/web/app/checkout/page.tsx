'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, CreditCard, ArrowLeft, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  const product = {
    name: 'PayKit Pro License',
    description: 'Unlimited projects, premium support, and advanced features',
    price: 99.0,
  };

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
    <div className="bg-background min-h-screen">
      {/* Simple Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/playground" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-bold">PayKit</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <Zap className="mr-1 h-3 w-3" />
            Local Provider
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-16">
        <div className="space-y-8 text-center">
          {/* Product */}
          <div className="space-y-2">
            <div className="text-4xl">💳</div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.description}</p>
            <div className="text-3xl font-bold">${product.price}</div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-left text-sm font-medium">Card Number</label>
              <Input
                type="text"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                className="text-center"
              />
              <p className="text-muted-foreground text-xs">Use test card: 4242 4242 4242 4242</p>
            </div>

            <Button onClick={handleCheckout} disabled={isProcessing || !cardNumber.trim()} size="lg" className="w-full">
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Pay ${product.price}
                </>
              )}
            </Button>

            <div className="text-muted-foreground flex items-center justify-center space-x-2 text-xs">
              <CreditCard className="h-3 w-3" />
              <span>Powered by PayKit Local Provider</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
