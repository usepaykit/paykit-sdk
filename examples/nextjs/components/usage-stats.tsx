'use client';

import { Card, Badge, Progress } from '@paykit-sdk/ui';
import { Zap, CheckSquare, TrendingUp } from 'lucide-react';

interface UsageStatsProps {
  status: { tier: string; usage: number; limit: number; tasksUsed: number; tasksLimit: number };
}

export function UsageStats({ status }: UsageStatsProps) {
  const aiUsagePercentage = (status.usage / status.limit) * 100;
  const taskUsagePercentage = status.tasksLimit > 0 ? (status.tasksUsed / status.tasksLimit) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card.Root>
        <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title className="text-sm font-medium">AI Generations</Card.Title>
          <Zap className="text-muted-foreground h-4 w-4" />
        </Card.Header>
        <Card.Content>
          <div className="text-2xl font-bold">
            {status.usage} / {status.limit}
          </div>
          <Progress value={aiUsagePercentage} className="mt-2" />
          <p className="text-muted-foreground mt-2 text-xs">{status.limit - status.usage} generations remaining</p>
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title className="text-sm font-medium">Tasks Created</Card.Title>
          <CheckSquare className="text-muted-foreground h-4 w-4" />
        </Card.Header>
        <Card.Content>
          <div className="text-2xl font-bold">
            {status.tasksUsed} / {status.tasksLimit > 0 ? status.tasksLimit : '∞'}
          </div>
          {status.tasksLimit > 0 && (
            <>
              <Progress value={taskUsagePercentage} className="mt-2" />
              <p className="text-muted-foreground mt-2 text-xs">{status.tasksLimit - status.tasksUsed} tasks remaining</p>
            </>
          )}
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title className="text-sm font-medium">Current Plan</Card.Title>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </Card.Header>
        <Card.Content>
          <div className="text-2xl font-bold capitalize">{status.tier}</div>
          <Badge variant={status.tier === 'free' ? 'secondary' : 'default'} className="mt-2">
            {status.tier === 'free' ? 'Free Tier' : 'Premium'}
          </Badge>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
