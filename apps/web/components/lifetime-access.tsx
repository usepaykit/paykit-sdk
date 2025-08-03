import { Button } from '@paykit-sdk/ui';
import { Card } from '@paykit-sdk/ui';
import { Check, Package } from 'lucide-react';
import { CreditCard } from 'lucide-react';
import Link from 'next/link';

export const LifetimeAccess = () => {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Get lifetime access to
              <br />
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">PayKit Cloud</span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Deploy your payment infrastructure with confidence. Platform integrations with Supabase, Vercel, and more.
            </p>
          </div>

          <div className="bg-muted/20 relative mt-12 rounded-2xl border p-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20"></div>
            <div className="bg-background relative rounded-xl p-8 md:p-12">
              <div className="mx-auto max-w-4xl">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Features */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">What’s included</h3>
                      <div className="space-y-3">
                        {[
                          'See total income across all platforms',
                          'Manage all customers in one place',
                          'Monitor payment events in real time',
                          'Create billing portals',
                          'Invite team members with permissions',
                          'Auto-organize customers and sales',
                        ].map(feature => (
                          <div key={feature} className="flex items-center space-x-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Card */}
                  <div className="space-y-6">
                    <Card.Root className="border-2 border-green-200 dark:border-green-800">
                      <Card.Header className="text-center">
                        <div className="mb-2 flex items-center justify-center">
                          <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <Card.Title className="text-2xl font-bold">Lifetime Access</Card.Title>
                        <Card.Description>One-time payment, forever access</Card.Description>
                      </Card.Header>
                      <Card.Content className="text-center">
                        <div className="mb-4">
                          <span className="text-4xl font-bold">$99</span>
                          <span className="text-muted-foreground text-sm"> USD</span>
                        </div>
                        <div className="space-y-2">
                          <div className="text-muted-foreground text-sm">Launching in v2</div>
                          <div className="text-muted-foreground text-sm">Never break your MRR streak</div>
                        </div>
                        <Button className="mt-6 w-full" size="lg" asChild>
                          <Link href={process.env.NEXT_PUBLIC_CHECKOUT_URL!} target="_blank">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Get Lifetime Access
                          </Link>
                        </Button>
                      </Card.Content>
                    </Card.Root>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
