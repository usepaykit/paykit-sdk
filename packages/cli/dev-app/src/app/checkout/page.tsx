import * as React from 'react';
import { CheckoutCard } from '@/components/checkout-card';
import { PaykitMetadata, safeDecode, type Checkout } from '@paykit-sdk/core';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

interface CheckoutPageProps {
  searchParams: Promise<{ id: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { id } = await searchParams;

  const headersList = await headers();
  const referer = headersList.get('referer');

  const checkoutInfo = safeDecode<Checkout & { provider_metadata: PaykitMetadata }>(id);

  if (!checkoutInfo.ok) return notFound();

  return <CheckoutCard {...checkoutInfo.value} referer={referer} />;
}
