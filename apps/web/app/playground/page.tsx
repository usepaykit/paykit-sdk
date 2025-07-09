'use client';

import React, { useState } from 'react';
import { LineAnimatedCodeViewer } from '@/components/line-animated-code-viewer';
import { Badge, Button, Card, Separator } from '@paykit-sdk/ui';
import {
  Play,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Terminal,
  Code2,
  Sparkles,
  ArrowRight,
  CreditCard,
  Webhook,
  RefreshCw,
  Copy,
  Home,
} from 'lucide-react';
import Link from 'next/link';

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';
type WebhookStatus = 'pending' | 'sent' | 'received';

interface MockPayment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  timestamp: Date;
  customer: string;
}

interface MockWebhook {
  id: string;
  event: string;
  status: WebhookStatus;
  timestamp: Date;
  payload: object;
}

export default function PlaygroundPage() {
  const [payments, setPayments] = useState<MockPayment[]>([]);
  const [webhooks, setWebhooks] = useState<MockWebhook[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(29.99);
  const [selectedScenario, setSelectedScenario] = useState<'success' | 'failure' | 'delayed'>('success');

  const scenarios = [
    { id: 'success', label: 'Successful Payment', description: 'Payment processes immediately' },
    { id: 'failure', label: 'Failed Payment', description: 'Payment fails with error' },
    { id: 'delayed', label: 'Delayed Payment', description: 'Payment takes 3 seconds to process' },
  ];

  const codeExample = [
    "import { PayKit } from '@paykit-sdk/core';",
    "import { local } from '@paykit-sdk/local';",

    '// Initialize with local provider',
    'const paykit = new PayKit(local());',

    '// Create a payment',
    'const payment = await paykit.payments.create({',
    '  amount: ${selectedAmount * 100}, // Amount in cents',
    "  currency: 'usd',",
    "  customer: 'cust_test_123',    ",
    '});',

    '// Handle webhook',
    "paykit.webhooks.on('payment.succeeded', (event) => {",
    "  console.log('Payment succeeded:', event.data);",
    '});',
  ];

  const simulatePayment = async () => {
    setIsProcessing(true);

    const paymentId = `pay_${Math.random().toString(36).substr(2, 9)}`;
    const newPayment: MockPayment = {
      id: paymentId,
      amount: selectedAmount,
      currency: 'USD',
      status: 'processing',
      timestamp: new Date(),
      customer: 'test_customer',
    };

    setPayments(prev => [newPayment, ...prev]);

    // Simulate webhook for payment.processing
    const processingWebhook: MockWebhook = {
      id: `wh_${Math.random().toString(36).substr(2, 9)}`,
      event: 'payment.processing',
      status: 'sent',
      timestamp: new Date(),
      payload: { payment_id: paymentId, status: 'processing' },
    };
    setWebhooks(prev => [processingWebhook, ...prev]);

    // Simulate processing delay based on scenario
    const delay = selectedScenario === 'delayed' ? 3000 : 1000;

    setTimeout(() => {
      const finalStatus: PaymentStatus = selectedScenario === 'failure' ? 'failed' : 'success';

      setPayments(prev => prev.map(p => (p.id === paymentId ? { ...p, status: finalStatus } : p)));

      // Simulate final webhook
      const finalWebhook: MockWebhook = {
        id: `wh_${Math.random().toString(36).substr(2, 9)}`,
        event: finalStatus === 'success' ? 'payment.succeeded' : 'payment.failed',
        status: 'sent',
        timestamp: new Date(),
        payload: { payment_id: paymentId, status: finalStatus },
      };
      setWebhooks(prev => [finalWebhook, ...prev]);

      setTimeout(() => {
        setWebhooks(prev => prev.map(w => (w.id === finalWebhook.id ? { ...w, status: 'received' } : w)));
      }, 200);

      setIsProcessing(false);
    }, delay);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample.join('\n'));
  };

  const clearLogs = () => {
    setPayments([]);
    setWebhooks([]);
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getWebhookIcon = (status: WebhookStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'sent':
        return <Zap className="h-3 w-3 text-blue-500" />;
      case 'received':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="text-lg font-bold">PayKit</span>
            </Link>
            <Separator.Root orientation="vertical" className="h-4" />
            <div className="flex items-center space-x-2">
              <Terminal className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Playground</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge.Root variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Local Provider
            </Badge.Root>
            <Link href="/">
              <Button.Root variant="ghost" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button.Root>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="bg-muted/50 mb-4 inline-flex items-center space-x-2 rounded-full border px-4 py-2 text-sm">
            <Play className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Interactive Playground</span>
            <Badge.Root variant="outline" className="ml-2">
              Live Testing
            </Badge.Root>
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Test PayKit&apos;s Local Provider</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Experiment with payments, webhooks, and different scenarios without any external APIs or configuration.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Control Panel */}
          <div className="space-y-6 lg:col-span-1">
            {/* Code Example */}
            <Card.Root>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code2 className="h-4 w-4 text-blue-500" />
                    <Card.Title className="text-lg">Code Example</Card.Title>
                  </div>
                  <Button.Root variant="ghost" size="sm" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                  </Button.Root>
                </div>
              </Card.Header>
              <Card.Content>
                <LineAnimatedCodeViewer lines={codeExample} />
              </Card.Content>
            </Card.Root>

            {/* Payment Controls */}
            <Card.Root>
              <Card.Header>
                <Card.Title className="text-lg">Payment Controls</Card.Title>
                <Card.Description>Configure and test different payment scenarios</Card.Description>
              </Card.Header>
              <Card.Content className="space-y-4">
                {/* Amount Selector */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Amount</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[9.99, 29.99, 99.99].map(amount => (
                      <Button.Root
                        key={amount}
                        variant={selectedAmount === amount ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedAmount(amount)}
                      >
                        ${amount}
                      </Button.Root>
                    ))}
                  </div>
                </div>

                {/* Scenario Selector */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Test Scenario</label>
                  <div className="space-y-2">
                    {scenarios.map(scenario => (
                      <button
                        key={scenario.id}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          selectedScenario === scenario.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedScenario(scenario.id as 'success' | 'failure' | 'delayed')}
                      >
                        <div className="text-sm font-medium">{scenario.label}</div>
                        <div className="text-muted-foreground text-xs">{scenario.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Button.Root onClick={simulatePayment} disabled={isProcessing} className="w-full" size="lg">
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Create Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button.Root>
                  <Button.Root variant="outline" onClick={clearLogs} className="w-full">
                    Clear Logs
                  </Button.Root>
                  <Link href="/checkout">
                    <Button.Root variant="secondary" className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Try Checkout Flow
                    </Button.Root>
                  </Link>
                </div>
              </Card.Content>
            </Card.Root>
          </div>

          {/* Activity Feed */}
          <div className="space-y-6 lg:col-span-2">
            {/* Payments Log */}
            <Card.Root>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <Card.Title className="text-lg">Payment Activity</Card.Title>
                  </div>
                  <Badge.Root variant="outline">{payments.length} payments</Badge.Root>
                </div>
              </Card.Header>
              <Card.Content>
                {payments.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    <CreditCard className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No payments yet. Create a payment to see activity here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.slice(0, 5).map(payment => (
                      <div key={payment.id} className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(payment.status)}
                          <div>
                            <div className="text-sm font-medium">{payment.id}</div>
                            <div className="text-muted-foreground text-xs">{payment.timestamp.toLocaleTimeString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${payment.amount} {payment.currency}
                          </div>
                          <Badge.Root
                            variant={payment.status === 'success' ? 'default' : payment.status === 'failed' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {payment.status}
                          </Badge.Root>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Content>
            </Card.Root>

            {/* Webhooks Log */}
            <Card.Root>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Webhook className="h-4 w-4 text-blue-500" />
                    <Card.Title className="text-lg">Webhook Events</Card.Title>
                  </div>
                  <Badge.Root variant="outline">{webhooks.length} events</Badge.Root>
                </div>
              </Card.Header>
              <Card.Content>
                {webhooks.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    <Webhook className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No webhook events yet. Create a payment to trigger webhooks.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {webhooks.slice(0, 8).map(webhook => (
                      <div key={webhook.id} className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          {getWebhookIcon(webhook.status)}
                          <div>
                            <div className="text-sm font-medium">{webhook.event}</div>
                            <div className="text-muted-foreground text-xs">{webhook.timestamp.toLocaleTimeString()}</div>
                          </div>
                        </div>
                        <Badge.Root variant={webhook.status === 'received' ? 'default' : 'secondary'} className="text-xs">
                          {webhook.status}
                        </Badge.Root>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Content>
            </Card.Root>
          </div>
        </div>
      </main>
    </div>
  );
}
