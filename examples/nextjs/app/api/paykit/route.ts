import { paykit } from '@/lib/paykit';
import { withNextJsWebhook } from '@paykit-sdk/local/plugins';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('POST request received');

  const webhook = paykit.webhooks
    .setup({ webhookSecret: process.env.POLAR_WEBHOOK_SECRET! })
    .on('$checkoutCreated', async e => {
      console.log('checkout created');
      console.log(e);
    })
    .on('$customerCreated', async customer => {
      console.log({ customer });
    })
    .on('$invoicePaid', async invoice => {
      console.log('Just made a sale!');
      console.log({ invoice });
    });

  const response = await withNextJsWebhook(request.nextUrl.toString(), webhook);

  return NextResponse.json(response);
}
