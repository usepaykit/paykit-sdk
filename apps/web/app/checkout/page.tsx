import * as React from 'react';
import { CheckoutCard } from '@/components/checkout-card';
import { safeDecode } from '@paykit-sdk/core';
import { PaymentInfo } from '@paykit-sdk/local';
import { notFound } from 'next/navigation';

interface CheckoutPageProps {
  searchParams: Promise<{ id: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { id } = await searchParams;

  const paymentInfo = safeDecode<PaymentInfo>(id);

  console.log({paymentInfo})

  if (!paymentInfo.ok) return notFound();

  return <CheckoutCard {...paymentInfo.value} />;
}
