import type { Task, User } from '../interface';

// Mock user data
export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '/placeholder.svg?height=40&width=40',
};

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create a modern, responsive landing page with hero section and pricing',
    status: 'in-progress',
    priority: 'high',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Set up secure user authentication with JWT tokens',
    status: 'todo',
    priority: 'medium',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    title: 'Write API documentation',
    description: 'Document all API endpoints with examples and response formats',
    status: 'completed',
    priority: 'low',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
  },
];

export const pricingPlans = [
  {
    name: 'Free',
    tier: 'free',
    price: 0,
    interval: 'month',
    features: ['3 AI generations per month', 'Up to 5 tasks', 'Basic templates', 'Email support'],
    aiGenerations: 3,
    tasks: 5,
  },
  {
    name: 'Pro',
    tier: 'pro',
    price: 19,
    interval: 'month',
    features: ['50 AI generations per month', 'Unlimited tasks', 'Advanced templates', 'Priority support', 'Export functionality'],
    aiGenerations: 50,
    tasks: 'unlimited',
    popular: true,
  },
];
