import * as React from 'react';
import { CheckoutCard } from '@/components/checkout-card';
import { safeDecode } from '@paykit-sdk/core';
import { CheckoutInfo } from '@paykit-sdk/local';
import { notFound } from 'next/navigation';

interface CheckoutPageProps {
  searchParams: Promise<{ id: string }>;
}

const checkoutInfo$1 = {
  name: 'PayKit Test Product',
  price: '$29.99',
  description: 'Testing PayKit Local Provider in development environment',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { id } = await searchParams;

  const checkoutInfo = safeDecode<CheckoutInfo>(id);

  if (!checkoutInfo.ok) return notFound();

  // return <CheckoutCard {...checkoutInfo.value} />

  return <CheckoutCard {...checkoutInfo$1} />;
}
