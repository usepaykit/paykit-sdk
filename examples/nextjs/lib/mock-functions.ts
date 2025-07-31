import type { Task, SubscriptionStatus, Subscription } from '../interface';
import { mockTasks, mockSubscription } from './mock-data';

// Mock subscription functions
export const checkSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return {
    tier: 'free',
    usage: 2,
    limit: 3,
    tasksUsed: 3,
    tasksLimit: 5,
  };
};

export const createCheckout = async (plan: string): Promise<{ url: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { url: '/mock-checkout' };
};

export const cancelSubscription = async (): Promise<{ success: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

export const getSubscriptionDetails = async (): Promise<Subscription> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockSubscription;
};

// Mock AI generation
export const generateContent = async (prompt: string): Promise<{ content: string }> => {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing

  const responses = [
    `Based on your prompt "${prompt}", here's a comprehensive task description that outlines the key objectives, deliverables, and success criteria for this project.`,
    `This task involves ${prompt.toLowerCase()} with a focus on quality, efficiency, and user experience. Key considerations include timeline, resources, and stakeholder requirements.`,
    `For ${prompt}, we should prioritize strategic planning, execution excellence, and measurable outcomes. This includes research, implementation, and evaluation phases.`,
  ];

  return {
    content: responses[Math.floor(Math.random() * responses.length)],
  };
};

// Mock task functions
export const createTask = async (data: Partial<Task>): Promise<Task> => {
  console.log('Mock createTask called with:', data);

  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate required fields
    if (!data.title || !data.description) {
      throw new Error('Title and description are required');
    }

    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 11), // Fixed deprecated substr
      title: data.title,
      description: data.description,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Mock createTask returning:', newTask);
    return newTask;
  } catch (error) {
    console.error('Error in createTask:', error);
    throw error;
  }
};

export const updateTask = async (id: string, data: Partial<Task>): Promise<Task> => {
  console.log('Mock updateTask called with:', id, data);
  await new Promise(resolve => setTimeout(resolve, 500));
  const existingTask = mockTasks.find(task => task.id === id) || mockTasks[0];
  const updatedTask = {
    ...existingTask,
    ...data,
    updatedAt: new Date(),
  };
  console.log('Mock updateTask returning:', updatedTask);
  return updatedTask;
};

export const deleteTask = async (id: string): Promise<{ success: boolean }> => {
  console.log('Mock deleteTask called with:', id);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
};

export const getTasks = async (): Promise<Task[]> => {
  console.log('Mock getTasks called');
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Mock getTasks returning:', mockTasks);
  return mockTasks;
};

export const getTask = async (id: string): Promise<Task | null> => {
  console.log('Mock getTask called with:', id);
  await new Promise(resolve => setTimeout(resolve, 500));
  const task = mockTasks.find(task => task.id === id) || null;
  console.log('Mock getTask returning:', task);
  return task;
};
