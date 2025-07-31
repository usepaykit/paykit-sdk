export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  subscription: SubscriptionTier
}

export type SubscriptionTier = "free" | "pro" | "enterprise"

export interface SubscriptionStatus {
  tier: SubscriptionTier
  usage: number
  limit: number
  tasksUsed: number
  tasksLimit: number
}

export interface PaykitMetadata {
  [key: string]: string | number | boolean
}

export type SubscriptionStatusType = "active" | "canceled" | "past_due" | "unpaid"

export interface Subscription {
  id: string
  customer_id: string
  status: SubscriptionStatusType
  current_period_start: Date
  current_period_end: Date
  metadata?: PaykitMetadata
}

export interface PricingPlan {
  name: string
  tier: SubscriptionTier
  price: number
  interval: string
  features: string[]
  aiGenerations: number
  tasks: number | "unlimited"
  popular?: boolean
}
