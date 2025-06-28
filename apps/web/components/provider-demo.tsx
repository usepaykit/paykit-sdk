'use client';

import * as React from 'react';
import { PaymentProvider } from '@paykit-sdk/core';
import { LineAnimatedCodeViewer } from './line-animated-code-viewer';
import { ProviderList } from './provider-list';

export function ProviderDemo() {
  const [selectedProvider, setSelectedProvider] = React.useState<PaymentProvider>('stripe');

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold">Switch providers with 2 lines</h2>
            <p className="text-muted-foreground">Watch only the changing lines animate in real-time</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Provider List - Left Side */}
            <div className="lg:col-span-1">
              <ProviderList selectedProvider={selectedProvider} onProviderSelect={setSelectedProvider} />
            </div>

            {/* Line Animated Code Viewer - Right Side */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} Implementation</h3>
                  <div className="text-muted-foreground text-sm">Only highlighted lines change</div>
                </div>
                <LineAnimatedCodeViewer provider={selectedProvider} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
