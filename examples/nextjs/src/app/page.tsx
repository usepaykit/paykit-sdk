'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { provider } from '@/lib/paykit';
import { PaykitProvider, useCheckout } from '@paykit-sdk/react';
import { Loader2 } from 'lucide-react';

// Paywall Modal Component
const PaywallModal = ({
  isOpen,
  onClose,
  onUpgrade,
  feature,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  feature: string;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="mx-4 w-full max-w-md">
        <CardHeader>
          <CardTitle>Upgrade Required</CardTitle>
          <p className="text-muted-foreground">You need Premium access to use {feature}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">Premium Plan</span>
              <span className="text-2xl font-bold">$29/mo</span>
            </div>
            <p className="text-sm text-gray-600">Access to all features</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onUpgrade} className="flex-1" disabled={isLoading}>
              Upgrade Now
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  onAccess 
}: { 
  title: string; 
  description: string; 
  icon: string; 
  onAccess: () => void 
}) => (
  <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onAccess}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

// Dashboard Component (wrapped with provider)
const Dashboard = () => {
  const [paywallModal, setPaywallModal] = useState<{ isOpen: boolean; feature: string }>({
    isOpen: false,
    feature: '',
  });

  const { create } = useCheckout();

  const handleFeatureAccess = (feature: string) => {
    setPaywallModal({ isOpen: true, feature });
  };

  const handleUpgrade = async () => {
    setPaywallModal({ isOpen: false, feature: '' });
    const { error, data } = await create.run({ 
      customer_id: '123', 
      item_id: '123', 
      metadata: {}, 
      session_type: 'recurring' 
    });
    if (error) {
      console.error('Checkout error:', error);
    } else {
      console.log('Checkout created:', data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">PayKit Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, John Doe</span>
            <Button variant="secondary" size="sm">
              Free Plan
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Unlock Premium Features</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Get access to advanced analytics, priority support, and exclusive tools
          </p>
          <Button size="lg" onClick={() => handleFeatureAccess('Premium Dashboard')}>
            Try Premium Features
          </Button>
        </div>

        {/* Features Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Advanced Analytics"
            description="Deep insights into your data with custom reports and real-time metrics"
            icon="📊"
            onAccess={() => handleFeatureAccess('Advanced Analytics')}
          />
          <FeatureCard
            title="Priority Support"
            description="Get 24/7 premium support with dedicated account management"
            icon="🎧"
            onAccess={() => handleFeatureAccess('Priority Support')}
          />
          <FeatureCard
            title="Custom Integrations"
            description="Connect with 100+ third-party tools and custom APIs"
            icon="🔗"
            onAccess={() => handleFeatureAccess('Custom Integrations')}
          />
          <FeatureCard
            title="Team Collaboration"
            description="Invite unlimited team members with role-based permissions"
            icon="👥"
            onAccess={() => handleFeatureAccess('Team Collaboration')}
          />
          <FeatureCard
            title="Export & Backup"
            description="Download your data in multiple formats with automated backups"
            icon="💾"
            onAccess={() => handleFeatureAccess('Export & Backup')}
          />
          <FeatureCard
            title="White Label"
            description="Customize the platform with your brand colors and logo"
            icon="🎨"
            onAccess={() => handleFeatureAccess('White Label')}
          />
        </div>

        {/* Pricing Section */}
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Premium Plan</CardTitle>
            <div className="text-4xl font-bold">$29/month</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                All premium features included
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Priority customer support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Cancel anytime
              </li>
            </ul>
            <div className="flex gap-2">
              <Button onClick={() => handleFeatureAccess('One-time Purchase')} className="flex-1">
                Buy Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={paywallModal.isOpen}
        onClose={() => setPaywallModal({ isOpen: false, feature: '' })}
        onUpgrade={handleUpgrade}
        isLoading={create.loading}
        feature={paywallModal.feature}
      />
    </div>
  );
};

export default function HomePage() {
  return (
    <PaykitProvider provider={provider}>
      <Dashboard />
    </PaykitProvider>
  );
}
