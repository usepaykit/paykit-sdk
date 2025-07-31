'use client';

import { useState, useEffect } from 'react';
import { AIGenerator } from '@/components/ai-generator';
import { Navigation } from '@/components/navigation';
import type { Task } from '@/interface';
import { getTask, updateTask } from '@/lib/mock-functions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Textarea, Button, Select, Label, Card, Toast, cn } from '@paykit-sdk/ui';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import * as RHF from 'react-hook-form';
import * as z from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  status: z.enum(['todo', 'in-progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function EditTaskPage() {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const { id } = useParams();

  const form = RHF.useForm<TaskFormData>({ resolver: zodResolver(taskSchema) });

  useEffect(() => {
    // Prevent the dynamic route from catching "new"
    if (id === 'new') {
      router.push('/tasks/new');
      return;
    }

    const loadTask = async () => {
      try {
        console.log('Loading task with ID:', id);
        const taskData = await getTask(id as string);
        if (taskData) {
          setTask(taskData);
          form.reset();
        } else {
          Toast.error({ title: 'Task not found' });
          router.push('/tasks');
        }
      } catch (error) {
        console.error('Error loading task:', error);
        Toast.error({ title: 'Failed to load task' });
        router.push('/tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, []);

  const onSubmit = async (data: TaskFormData) => {
    setSaving(true);
    try {
      await updateTask(id as string, data);
      Toast.success({ title: 'Task updated successfully' });
      router.push('/tasks');
    } catch (error) {
      Toast.error({ title: 'Failed to update task' });
    } finally {
      setSaving(false);
    }
  };

  const handleAIGenerated = (content: string) => {
    form.setValue('description', content);
    setShowAIGenerator(false);
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

  if (!task) {
    return (
      <div className="bg-background min-h-screen">
        <Navigation />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-foreground font-outfit mb-4 text-2xl font-bold">Task Not Found</h1>
            <Button asChild>
              <Link href="/tasks">Back to Tasks</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/tasks">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-foreground font-outfit text-3xl font-bold">Edit Task</h1>
              <p className="text-muted-foreground mt-1">Update your task details.</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card.Root>
              <Card.Header>
                <Card.Title className="font-outfit">Task Details</Card.Title>
                <Card.Description>Update the information for your task</Card.Description>
              </Card.Header>
              <Card.Content>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <RHF.Controller
                    name="title"
                    control={form.control}
                    render={({ field, fieldState: { error } }) => (
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="Enter task title..." {...field} className={cn(error && 'border-destructive')} />
                        {error && <p className="text-destructive text-sm">{error.message}</p>}
                      </div>
                    )}
                  />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">Description</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowAIGenerator(!showAIGenerator)}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Generate
                      </Button>
                    </div>

                    <RHF.Controller
                      name="description"
                      control={form.control}
                      render={({ field, fieldState: { error } }) => (
                        <div className="space-y-2">
                          <Textarea
                            id="description"
                            placeholder="Describe your task..."
                            className={cn('min-h-[120px]', error ? 'border-destructive' : '')}
                            {...field}
                          />
                          {error && <p className="text-destructive text-sm">{error.message}</p>}
                        </div>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <RHF.Controller
                        name="status"
                        control={form.control}
                        render={({ field, fieldState: { error } }) => (
                          <div className="space-y-2">
                            <Select.Root onValueChange={field.onChange} value={field.value}>
                              <Select.Trigger>
                                <Select.Value placeholder="Select status" />
                              </Select.Trigger>
                              <Select.Content>
                                <Select.Item value="todo">To Do</Select.Item>
                                <Select.Item value="in-progress">In Progress</Select.Item>
                                <Select.Item value="completed">Completed</Select.Item>
                              </Select.Content>
                            </Select.Root>
                            {error && <p className="text-destructive text-sm">{error.message}</p>}
                          </div>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <RHF.Controller
                        name="priority"
                        control={form.control}
                        render={({ field, fieldState: { error } }) => (
                          <div className="space-y-2">
                            <Select.Root onValueChange={field.onChange} value={field.value}>
                              <Select.Trigger>
                                <Select.Value placeholder="Select priority" />
                              </Select.Trigger>
                              <Select.Content>
                                <Select.Item value="low">Low</Select.Item>
                                <Select.Item value="medium">Medium</Select.Item>
                                <Select.Item value="high">High</Select.Item>
                              </Select.Content>
                            </Select.Root>
                            {error && <p className="text-destructive text-sm">{error.message}</p>}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving ? (
                        'Saving...'
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link href="/tasks">Cancel</Link>
                    </Button>
                  </div>
                </form>
              </Card.Content>
            </Card.Root>

            {/* AI Generator */}
            {showAIGenerator && (
              <AIGenerator onGenerated={handleAIGenerated} placeholder="Describe what kind of task description you want to generate..." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
