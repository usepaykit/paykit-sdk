'use client';

import type { Task } from '@/interface';
import { Card, Badge, Button, DropdownMenu } from '@paykit-sdk/ui';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface TaskCardProps {
  task: Task;
  onDelete?: (id: string) => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'low':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary text-primary-foreground';
      case 'in-progress':
        return 'bg-accent text-accent-foreground';
      case 'todo':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-3 w-3" />;
      case 'medium':
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card.Root className="transition-shadow duration-200 hover:shadow-md">
      <Card.Header className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <Card.Title className="font-outfit text-lg leading-tight">{task.title}</Card.Title>
            <Card.Description className="line-clamp-2">{task.description}</Card.Description>
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item asChild>
                <Link href={`/tasks/${task.id}`} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => onDelete?.(task.id)} className="text-destructive cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </Card.Header>
      <Card.Content>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(task.status)}>{task.status.replace('-', ' ')}</Badge>
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              {getPriorityIcon(task.priority)}
              <span className="ml-1 capitalize">{task.priority}</span>
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">{format(task.updatedAt, 'MMM dd')}</p>
        </div>
      </Card.Content>
    </Card.Root>
  );
}
