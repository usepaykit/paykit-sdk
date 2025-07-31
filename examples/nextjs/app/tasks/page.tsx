'use client';

import * as React from 'react';
import { Navigation } from '@/components/navigation';
import { TaskCard } from '@/components/task-card';
import type { Task } from '@/interface';
import { getTasks, deleteTask } from '@/lib/mock-functions';
import { Button, Input, Select, Toast } from '@paykit-sdk/ui';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');

  React.useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasksData = await getTasks();
        setTasks(tasksData);
        setFilteredTasks(tasksData);
      } catch (error) {
        Toast.error({ title: 'Failed to load tasks' });
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  React.useEffect(() => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        task => task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
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

  return (
    <div className="bg-background min-h-screen">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-foreground font-outfit text-3xl font-bold">Tasks</h1>
              <p className="text-muted-foreground mt-1">Manage and organize all your tasks in one place.</p>
            </div>
            <Button asChild>
              <Link href="/tasks/new">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
              <Select.Trigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <Select.Value placeholder="Status" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Status</Select.Item>
                <Select.Item value="todo">To Do</Select.Item>
                <Select.Item value="in-progress">In Progress</Select.Item>
                <Select.Item value="completed">Completed</Select.Item>
              </Select.Content>
            </Select.Root>
            <Select.Root value={priorityFilter} onValueChange={setPriorityFilter}>
              <Select.Trigger className="w-full sm:w-[180px]">
                <Select.Value placeholder="Priority" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Priority</Select.Item>
                <Select.Item value="high">High</Select.Item>
                <Select.Item value="medium">Medium</Select.Item>
                <Select.Item value="low">Low</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} onDelete={handleDeleteTask} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="text-muted-foreground mb-4 text-lg">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' ? 'No tasks match your filters' : 'No tasks yet'}
              </div>
              <Button asChild>
                <Link href="/tasks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Task
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
