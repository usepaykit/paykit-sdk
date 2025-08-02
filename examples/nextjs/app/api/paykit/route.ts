import { paykit } from '@/lib/paykit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('POST request received');

  const webhook = paykit.webhooks
    .setup({ webhookSecret: process.env.POLAR_WEBHOOK_SECRET! })
    .on('$checkoutCreated', async e => {
      console.log('checkout created');
      console.log(e);
    })
    .on('$customerCreated', async e => {
      console.log({ e });
    })
    .on('$paymentReceived', async e => {
      console.log('Just made a sale!');
      console.log(e);
    });

  const headers = Object.fromEntries(request.headers.entries());
  const body = await request.text();
  await webhook.handle({ body, headers });

  return NextResponse.json({ success: true });
}
