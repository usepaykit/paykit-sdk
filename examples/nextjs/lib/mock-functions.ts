import { setTimeout } from 'timers/promises';
import type { Task } from '../interface';
import { mockTasks } from './mock-data';

export const generateContent = async (prompt: string): Promise<{ content: string }> => {
  await setTimeout(2000);

  const responses = [
    `Based on your prompt "${prompt}", here's a comprehensive task description that outlines the key objectives, deliverables, and success criteria for this project.`,
    `This task involves ${prompt.toLowerCase()} with a focus on quality, efficiency, and user experience. Key considerations include timeline, resources, and stakeholder requirements.`,
    `For ${prompt}, we should prioritize strategic planning, execution excellence, and measurable outcomes. This includes research, implementation, and evaluation phases.`,
  ];

  return {
    content: responses[Math.floor(Math.random() * responses.length)],
  };
};

export const createTask = async (data: Partial<Task>): Promise<Task> => {
  console.log('Mock createTask called with:', data);

  try {
    await setTimeout(1000);

    if (!data.title || !data.description) {
      throw new Error('Title and description are required');
    }

    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 11),
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
  await setTimeout(500);

  const existingTask = mockTasks.find(task => task.id === id) || mockTasks[0];

  const updatedTask = { ...existingTask, ...data, updatedAt: new Date() };

  return updatedTask;
};

export const deleteTask = async (id: string): Promise<{ success: boolean }> => {
  await setTimeout(500);

  return { success: true };
};

export const getTasks = async (): Promise<Task[]> => {
  await setTimeout(500);

  return mockTasks;
};

export const getTask = async (id: string): Promise<Task | null> => {
  await setTimeout(500);
  const task = mockTasks.find(task => task.id === id) || null;

  return task;
};
