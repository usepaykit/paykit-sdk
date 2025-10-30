'use client';

import * as React from 'react';
import { Badge } from '@paykit-sdk/ui';
import { Code2 } from 'lucide-react';
import { Paykit as PaykitIcon } from './icons';
import { LineAnimatedCodeViewer } from './line-animated-code-viewer';
import { ProviderList } from './provider-list';

const getCodeLines = (provider: string) => [
  "import { PayKit } from '@paykit-sdk/core';",
  `import { ${provider} } from '@paykit-sdk/${provider}';`,
  '',
  `const provider = ${provider}();`,
  'const paykit = new PayKit(provider);',
  '',
  'const customer = await paykit.customers.create({',
  "  email: 'customer@example.com',",
  '});',
  '',
  'const checkout = await paykit.checkouts.create({',
  '  customer_id: customer.id,',
  "  metadata: { order_id: '123' },",
  "  session_type: 'one_time',",
  "  item_id: 'price_123',",
  '});',
];

export function ProviderDemo() {
  const [selectedProvider, setSelectedProvider] = React.useState<string>('stripe');

  return (
    <section className="relative py-4">
      {/* Background Pattern */}
      <div className="from-muted/30 via-background to-muted/20 absolute inset-0 bg-gradient-to-br" />

      <div className="relative container mx-auto px-6">
        <div className="mx-auto max-w-6xl">
          {/* Enhanced Section Header */}
          <div className="mb-16 text-center">
            <div className="bg-muted/50 mb-6 inline-flex items-center space-x-2 rounded-full border px-4 py-2 text-sm">
              <Code2 className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Interactive Demo</span>
              <Badge variant="secondary" className="ml-2">
                Live Code
              </Badge>
            </div>

            <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
              Switch providers with
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                just 2 lines of code
              </span>
            </h2>

            <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
              Watch the magic happen. Only the lines that change between providers will
              animate, showing you exactly what needs to be modified.
            </p>
          </div>

          {/* Demo Content */}
          <div className="relative">
            {/* Gradient Border Effect */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20 blur"></div>

            <div className="bg-background relative rounded-2xl border shadow-2xl">
              <div className="grid grid-cols-1 gap-0 lg:grid-cols-4">
                {/* Provider List - Left Side */}
                <div className="border-border/50 border-r lg:col-span-1">
                  <div className="p-6">
                    <div className="mb-4 flex items-center space-x-2">
                      <PaykitIcon className="size-4 text-blue-500" />
                      <span className="text-muted-foreground text-sm font-medium">
                        Providers
                      </span>
                    </div>
                    <ProviderList
                      selectedProvider={selectedProvider}
                      onProviderSelect={setSelectedProvider}
                    />
                  </div>
                </div>

                {/* Code Viewer - Right Side */}
                <div className="lg:col-span-3">
                  <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {selectedProvider.charAt(0).toUpperCase() +
                              selectedProvider.slice(1)}{' '}
                            Implementation
                          </h3>
                          <p className="text-muted-foreground text-sm">TypeScript</p>
                        </div>
                      </div>
                    </div>
                    <LineAnimatedCodeViewer lines={getCodeLines(selectedProvider)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
