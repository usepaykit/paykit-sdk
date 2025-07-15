'use client';

import * as React from 'react';
import { CustomerInfoModal } from '@/components/customer-info-modal';
import { DashboardHeader } from '@/components/dashboard-header';
import { provider } from '@/lib/paykit';
import { PaykitProvider, useCheckout } from '@paykit-sdk/react';
import { Card, Button, Badge } from '@paykit-sdk/ui';
import {
  TrendingUp,
  Users,
  CreditCard,
  DollarSign,
  Zap,
  ArrowUpRight,
  BarChart3,
  Clock,
  CheckCircle,
  Star,
  Crown,
  Eye,
  UserPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: any;
  trend?: 'up' | 'down';
}

const MetricCard = ({ title, value, change, icon: Icon, trend = 'up' }: MetricCardProps) => {
  return (
    <Card.Root className="p-6 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <Badge variant={trend === 'up' ? 'default' : 'destructive'} className="text-xs">
              {trend === 'up' ? '+' : '-'}
              {change}
            </Badge>
          </div>
        </div>
        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
          <Icon className="text-primary h-6 w-6" />
        </div>
      </div>
    </Card.Root>
  );
};

const UpgradeCard = () => {
  const { create } = useCheckout();
  const router = useRouter();

  const handleUpgrade = async () => {
    const { data, error } = await create.run({
      customer_id: 'demo_customer',
      item_id: 'pro_plan',
      session_type: 'recurring',
      metadata: { plan: 'pro', billing: 'monthly' },
    });

    if (error) throw new Error(error.message);

    console.log({ data });

    router.push(data.payment_url);
  };

  return (
    <Card.Root className="relative overflow-hidden border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
      <div className="relative p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            <Badge variant="secondary" className="border-purple-200 bg-purple-100 text-purple-700">
              Pro Plan
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-sm">Starting at</p>
            <p className="text-2xl font-bold text-purple-600">$29/mo</p>
          </div>
        </div>

        <h3 className="mb-2 text-lg font-semibold">Unlock Advanced Analytics</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Get real-time insights, advanced reporting, and priority support to grow your business faster.
        </p>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Real-time analytics</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Custom reports</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Priority support</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>API access</span>
          </div>
        </div>

        <Button onClick={handleUpgrade} disabled={create.loading} className="w-full bg-purple-600 hover:bg-purple-700">
          {create.loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating checkout...
            </div>
          ) : (
            <>
              Upgrade Now
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Card.Root>
  );
};

const RevenueChart = () => {
  return (
    <Card.Root className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Revenue Overview</h3>
          <p className="text-muted-foreground text-sm">Last 30 days performance</p>
        </div>
        <BarChart3 className="text-muted-foreground h-5 w-5" />
      </div>

      <div className="space-y-4">
        <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium">Subscription Revenue</span>
          </div>
          <span className="text-sm font-semibold">$12,450</span>
        </div>
        <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">One-time Purchases</span>
          </div>
          <span className="text-sm font-semibold">$8,230</span>
        </div>
        <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-sm font-medium">Upgrades</span>
          </div>
          <span className="text-sm font-semibold">$3,120</span>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Total Revenue</span>
          <span className="text-xl font-bold text-green-600">$23,800</span>
        </div>
      </div>
    </Card.Root>
  );
};

const RecentCustomers = ({ onViewCustomer }: { onViewCustomer: (customerId: string) => void }) => {
  const customers = [
    { id: 'cus_1234', name: 'John Smith', email: 'john@example.com', status: 'active', joined: '2 min ago' },
    { id: 'cus_1235', name: 'Sarah Wilson', email: 'sarah@example.com', status: 'active', joined: '15 min ago' },
    { id: 'cus_1236', name: 'Mike Johnson', email: 'mike@example.com', status: 'inactive', joined: '1 hour ago' },
    { id: 'cus_1237', name: 'Emma Davis', email: 'emma@example.com', status: 'active', joined: '2 hours ago' },
  ];

  return (
    <Card.Root className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recent Customers</h3>
          <p className="text-muted-foreground text-sm">Latest customer activity</p>
        </div>
        <Button variant="ghost" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="space-y-3">
        {customers.map(customer => (
          <div key={customer.id} className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{customer.name}</p>
                <p className="text-muted-foreground text-xs">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <Badge variant={customer.status === 'active' ? 'default' : 'secondary'} className="mb-1 text-xs">
                  {customer.status}
                </Badge>
                <p className="text-muted-foreground text-xs">{customer.joined}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onViewCustomer(customer.id)} className="ml-2">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card.Root>
  );
};

const QuickStats = () => {
  return (
    <Card.Root className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Quick Insights</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <Clock className="text-muted-foreground mx-auto mb-2 h-5 w-5" />
          <p className="text-2xl font-bold">24h</p>
          <p className="text-muted-foreground text-xs">Avg Response Time</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <Star className="mx-auto mb-2 h-5 w-5 text-yellow-500" />
          <p className="text-2xl font-bold">4.9</p>
          <p className="text-muted-foreground text-xs">Customer Rating</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <TrendingUp className="mx-auto mb-2 h-5 w-5 text-green-500" />
          <p className="text-2xl font-bold">28%</p>
          <p className="text-muted-foreground text-xs">Growth Rate</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <Zap className="mx-auto mb-2 h-5 w-5 text-blue-500" />
          <p className="text-2xl font-bold">99.9%</p>
          <p className="text-muted-foreground text-xs">Uptime</p>
        </div>
      </div>
    </Card.Root>
  );
};

const Dashboard = () => {
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = React.useState(false);

  const handleViewCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCustomerModalOpen(true);
  };

  return (
    <div className="bg-background min-h-screen">
      <DashboardHeader />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-lg">Monitor your payment performance and grow your business with real-time insights.</p>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Revenue" value="$45,231" change="20.1%" icon={DollarSign} trend="up" />
          <MetricCard title="Active Customers" value="2,350" change="18.1%" icon={Users} trend="up" />
          <MetricCard title="Subscriptions" value="1,234" change="19%" icon={CreditCard} trend="up" />
          <MetricCard title="Conversion Rate" value="3.2%" change="4.3%" icon={TrendingUp} trend="up" />
        </div>

        {/* Main Content Grid */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Revenue Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>

          {/* Upgrade Card */}
          <UpgradeCard />
        </div>

        {/* Secondary Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Recent Customers - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentCustomers onViewCustomer={handleViewCustomer} />
          </div>

          {/* Quick Stats */}
          <QuickStats />
        </div>
      </main>

      {/* <CustomerInfoModal customerId={selectedCustomerId} open={customerModalOpen} onOpenChange={setCustomerModalOpen} /> */}
    </div>
  );
};

export default () => {
  return (
    <PaykitProvider provider={provider}>
      <Dashboard />
    </PaykitProvider>
  );
};
