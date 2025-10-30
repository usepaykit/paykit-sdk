'use client';

import { cn } from '@paykit-sdk/ui';

interface ProviderListProps {
  selectedProvider: string;
  onProviderSelect: (provider: string) => void;
}

const providers = [
  {
    key: 'stripe' as const,
    name: 'Stripe',
    description: 'Global payment processing',
  },
  {
    key: 'paypal' as const,
    name: 'PayPal',
    description: 'PayPal payments',
  },
  {
    key: 'polar' as const,
    name: 'Polar',
    description: 'Open source monetization',
  },
  {
    key: 'gopay' as const,
    name: 'GoPay',
    description: 'Monetization in Czechia',
  },
];

export function ProviderList({ selectedProvider, onProviderSelect }: ProviderListProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-muted-foreground mb-4 text-sm font-medium">
        Payment Providers
      </h3>
      {providers.map(provider => (
        <button
          key={provider.key}
          onClick={() => onProviderSelect(provider.key)}
          className={cn(
            'w-full cursor-pointer rounded-lg p-3 text-left transition-colors',
            selectedProvider === provider.key
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          )}
        >
          <div className="font-medium">{provider.name}</div>
          <div className="text-muted-foreground mt-1 text-xs">{provider.description}</div>
        </button>
      ))}
    </div>
  );
}
