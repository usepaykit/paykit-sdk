import { paykit } from '@/lib/paykit';
import { withLocalProviderNextPlugin } from '@paykit-sdk/local/plugins';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const url = request.nextUrl.toString();

  const headers = Object.fromEntries(request.headers.entries());
  const body = await request.text();

  const webhook = paykit.webhooks
    .setup({ webhookSecret: '123' })
    .on('$customerCreated', async e => {
      console.log({ e });
    })
    .on('$paymentReceived', async e => {
      console.log('Just made a sale!');
      console.log(e);
    });

  const result = await webhook.handle({ body, headers });

  // Only add this line for local provider
  await withLocalProviderNextPlugin({ url, webhook });

  return NextResponse.json(result);
}
