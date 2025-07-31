import { paykit } from '@/lib/paykit';
import { server$HandleWebhook } from '@paykit-sdk/local/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const webhook = paykit.webhooks
    .setup({ webhookSecret: '123' })
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
  server$HandleWebhook({ url: request.nextUrl.toString(), webhook });

  return NextResponse.json({ success: true });
}
