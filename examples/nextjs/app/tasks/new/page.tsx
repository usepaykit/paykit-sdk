'use client';

import { useState } from 'react';
import { AIGenerator } from '@/components/ai-generator';
import { Navigation } from '@/components/navigation';
import { createTask } from '@/lib/mock-functions';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn, Textarea, Select, Label, Input, Card, Toast, Button } from '@paykit-sdk/ui';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as RHF from 'react-hook-form';
import * as z from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  status: z.enum(['todo', 'in-progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const form = RHF.useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    console.log('Form submitted with data:', data);
    setLoading(true);

    try {
      // Validate the data before sending
      const validatedData = taskSchema.parse(data);
      console.log('Validated data:', validatedData);

      const newTask = await createTask(validatedData);
      console.log('Task created successfully:', newTask);

      Toast.success({ title: 'Task created successfully!' });

      // Use replace instead of push to avoid back button issues
      router.replace('/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      Toast.error({ title: 'Failed to create task. Please try again.' });
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleAIGenerated = (content: string) => {
    form.setValue('description', content);
    setShowAIGenerator(false);
  };

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
              <h1 className="text-foreground font-outfit text-3xl font-bold">Create New Task</h1>
              <p className="text-muted-foreground mt-1">Add a new task to your workflow.</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Task Form */}
            <Card.Root>
              <Card.Header>
                <Card.Title className="font-outfit">Task Details</Card.Title>
                <Card.Description>Fill in the information for your new task</Card.Description>
              </Card.Header>
              <Card.Content>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <RHF.Controller
                      name="title"
                      control={form.control}
                      render={({ field, fieldState: { error } }) => (
                        <div className="space-y-2">
                          <Input id="title" placeholder="Enter task title..." {...field} className={error ? 'border-destructive' : ''} />
                          {error && <p className="text-destructive text-sm">{error.message}</p>}
                        </div>
                      )}
                    />
                  </div>

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
                            <Select.Root onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Select.Root onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        'Creating...'
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Create Task
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
