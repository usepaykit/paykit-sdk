'use client';

import * as React from 'react';
import { Navigation } from '@/components/navigation';
import { SubscriptionModal } from '@/components/subscription-modal';
import { mockUser, pricingPlans } from '@/lib/mock-data';
import { Badge, Button, Card, Input, Label, Separator, Toast, Avatar } from '@paykit-sdk/ui';
import { User, CreditCard, Bell, Shield, Trash2, Crown } from 'lucide-react';

export default function SettingsPage() {
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const currentPlan = pricingPlans.find(plan => plan.tier === mockUser.subscription);

  const handleSaveProfile = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    Toast.success({ title: 'Profile updated successfully!' });
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    Toast.success({ title: 'Subscription cancelled successfully!' });
  };

  return (
    <div className="bg-background min-h-screen">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-foreground font-outfit text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
          </div>

          <div className="grid gap-8">
            {/* Profile Settings */}
            <Card.Root>
              <Card.Header>
                <Card.Title className="font-outfit flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </Card.Title>
                <Card.Description>Update your personal information and profile details</Card.Description>
              </Card.Header>
              <Card.Content className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar.Root className="h-20 w-20">
                    <Avatar.Image src={mockUser.avatar || '/placeholder.svg'} alt={mockUser.name} />
                    <Avatar.Fallback className="text-lg">{mockUser.name.charAt(0)}</Avatar.Fallback>
                  </Avatar.Root>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                    <p className="text-muted-foreground text-sm">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={mockUser.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={mockUser.email} />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Card.Content>
            </Card.Root>

            {/* Subscription Settings */}
            <Card.Root>
              <Card.Header>
                <Card.Title className="font-outfit flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription & Billing
                </Card.Title>
                <Card.Description>Manage your subscription plan and billing information</Card.Description>
              </Card.Header>
              <Card.Content className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-outfit font-semibold">{currentPlan?.name} Plan</h3>
                      {currentPlan?.popular && (
                        <Badge className="bg-primary text-primary-foreground">
                          <Crown className="mr-1 h-3 w-3" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{currentPlan?.price === 0 ? 'Free forever' : `$${currentPlan?.price}/month`}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowSubscriptionModal(true)}>
                      View Details
                    </Button>
                    {mockUser.subscription !== 'enterprise' && <Button>Upgrade Plan</Button>}
                  </div>
                </div>

                {currentPlan && (
                  <div className="space-y-3">
                    <h4 className="font-outfit font-medium">Current Plan Features:</h4>
                    <ul className="space-y-2">
                      {currentPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {mockUser.subscription !== 'free' && (
                  <div className="border-t pt-4">
                    <Button variant="destructive" onClick={handleCancelSubscription} disabled={loading}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cancel Subscription
                    </Button>
                    <p className="text-muted-foreground mt-2 text-sm">
                      Your subscription will remain active until the end of the current billing period.
                    </p>
                  </div>
                )}
              </Card.Content>
            </Card.Root>

            {/* Notification Settings */}
            <Card.Root>
              <Card.Header>
                <Card.Title className="font-outfit flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </Card.Title>
                <Card.Description>Configure how you receive notifications</Card.Description>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-muted-foreground text-sm">Receive email updates about your tasks and account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-muted-foreground text-sm">Get notified about important updates and reminders</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </Card.Content>
            </Card.Root>

            {/* Security Settings */}
            <Card.Root>
              <Card.Header>
                <Card.Title className="font-outfit flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </Card.Title>
                <Card.Description>Manage your account security and privacy settings</Card.Description>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Change Password</p>
                    <p className="text-muted-foreground text-sm">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-muted-foreground text-sm">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Delete Account</p>
                    <p className="text-muted-foreground text-sm">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </Card.Content>
            </Card.Root>
          </div>
        </div>
      </div>

      <SubscriptionModal open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal} />
    </div>
  );
}
