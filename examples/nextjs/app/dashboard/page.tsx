'use client';

import * as React from 'react';
import { Navigation } from '@/components/navigation';
import { SubscriptionModal } from '@/components/subscription-modal';
import { TaskCard } from '@/components/task-card';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { UsageStats } from '@/components/usage-stats';
import type { Task } from '@/interface';
import { getTasks, deleteTask } from '@/lib/mock-functions';
import { Subscription } from '@paykit-sdk/core';
import { useSubscription } from '@paykit-sdk/react';
import { Button, Card, Toast } from '@paykit-sdk/ui';
import { Plus, TrendingUp, Users, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';

const subscriptionId = 'sub_WEqpOMtKCIJlR4a-elBZEHnSfFq0yu';

export default function Dashboard() {
  const { retrieve } = useSubscription();
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const [subscription, tasks] = await Promise.all([retrieve.run(subscriptionId), getTasks()]);

      const [data, error] = subscription;
      if (data) return setSubscription(data);
      if (error) Toast.error({ title: 'Error', description: error.message });

      if (tasks) return setTasks(tasks);
    })();
  }, []);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData] = await Promise.all([getTasks()]);
        setTasks(tasksData);
      } catch (error) {
        Toast.error({ title: 'Failed to load dashboard data' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
      Toast.success({ title: 'Task deleted successfully' });
    } catch (error) {
      Toast.error({ title: 'Failed to delete task' });
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Navigation />
        <div className="flex h-96 items-center justify-center">
          <div className="border-primary h-32 w-32 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  const recentTasks = tasks.slice(0, 3);
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;

  const hasActiveSubscription = subscription && subscription.status === 'active' && subscription.metadata?.plan === 'pro';

  return (
    <div className="bg-background min-h-screen">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-foreground font-outfit text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your tasks.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSubscriptionModal(true)} className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                View Subscription
              </Button>
              <Button asChild>
                <Link href="/tasks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Link>
              </Button>
            </div>
          </div>

          <UsageStats
            status={{
              limit: hasActiveSubscription ? 50 : 10,
              usage: hasActiveSubscription ? 0 : 10,
              tier: hasActiveSubscription ? 'pro' : 'free',
              tasksLimit: hasActiveSubscription ? -1 : 10,
              tasksUsed: hasActiveSubscription ? 0 : 10,
            }}
          />

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card.Root className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Card.Title className="text-sm font-medium">Total Tasks</Card.Title>
                <Calendar className="text-muted-foreground h-4 w-4" />
              </Card.Header>
              <Card.Content>
                <div className="font-outfit text-2xl font-bold">{tasks.length}</div>
                <p className="text-muted-foreground text-xs">All your tasks</p>
              </Card.Content>
            </Card.Root>

            <Card.Root className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Card.Title className="text-sm font-medium">In Progress</Card.Title>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </Card.Header>
              <Card.Content>
                <div className="font-outfit text-2xl font-bold">{inProgressTasks}</div>
                <p className="text-muted-foreground text-xs">Currently working on</p>
              </Card.Content>
            </Card.Root>

            <Card.Root className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Card.Title className="text-sm font-medium">Completed</Card.Title>
                <Users className="text-muted-foreground h-4 w-4" />
              </Card.Header>
              <Card.Content>
                <div className="font-outfit text-2xl font-bold">{completedTasks}</div>
                <p className="text-muted-foreground text-xs">Tasks finished</p>
              </Card.Content>
            </Card.Root>

            <Card.Root className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Card.Title className="text-sm font-medium">Success Rate</Card.Title>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </Card.Header>
              <Card.Content>
                <div className="font-outfit text-2xl font-bold">{tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%</div>
                <p className="text-muted-foreground text-xs">Completion rate</p>
              </Card.Content>
            </Card.Root>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Recent Tasks */}
            <div className="space-y-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-outfit text-xl font-semibold">Recent Tasks</h2>
                <Button variant="outline" asChild>
                  <Link href="/tasks">View All</Link>
                </Button>
              </div>

              {recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {recentTasks.map(task => (
                    <TaskCard key={task.id} task={task} onDelete={handleDeleteTask} />
                  ))}
                </div>
              ) : (
                <Card.Root className="p-8 text-center">
                  <Card.Description>No tasks yet. Create your first task to get started!</Card.Description>
                  <Button className="mt-4" asChild>
                    <Link href="/tasks/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Task
                    </Link>
                  </Button>
                </Card.Root>
              )}
            </div>

            {/* Upgrade Prompt */}
            <div className="space-y-6">
              {!hasActiveSubscription && <UpgradePrompt feature="AI generations" currentPlan={subscription?.metadata?.['tier']!} />}

              <Card.Root>
                <Card.Header>
                  <Card.Title className="font-outfit text-lg">Quick Actions</Card.Title>
                  <Card.Description>Common tasks you might want to perform</Card.Description>
                </Card.Header>
                <Card.Content className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/tasks/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Task
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/tasks">
                      <Calendar className="mr-2 h-4 w-4" />
                      View All Tasks
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/settings">
                      <Users className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </Button>
                </Card.Content>
              </Card.Root>
            </div>
          </div>
        </div>
      </div>

      <SubscriptionModal open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal} />
    </div>
  );
}
