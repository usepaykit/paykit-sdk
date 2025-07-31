import * as React from 'react';
import { CheckoutCard } from '@/components/checkout-card';
import { safeDecode, type Checkout } from '@paykit-sdk/core';
import { notFound } from 'next/navigation';

interface CheckoutPageProps {
  searchParams: Promise<{ id: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { id } = await searchParams;

  const checkoutInfo = safeDecode<Checkout>(id);

  if (!checkoutInfo.ok) return notFound();

  return <CheckoutCard {...checkoutInfo.value} />;
}
