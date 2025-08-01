import { paykit } from '@/lib/paykit';
import { withNextJsWebhook } from '@paykit-sdk/local/plugins';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('POST request received');

  const webhook = paykit.webhooks
    .setup({ webhookSecret: '123' })
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

  /**
   *  const headers = Object.fromEntries(request.headers.entries());
   *  const body = await request.text();
   *  const result = await webhook.handle({ body, headers });
   */

  // only for local provider
  const response = await withNextJsWebhook(request.nextUrl.toString(), webhook);

  return NextResponse.json(response);
}
