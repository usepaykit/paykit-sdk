import { paykit } from '@/lib/paykit';
import { local$NextPlugin } from '@paykit-sdk/local/plugins';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, response: NextResponse) {
  return local$NextPlugin(request);
}

export async function POST(request: NextRequest, response: NextResponse) {
  return local$NextPlugin(request);
}

export async function PUT(request: NextRequest, response: NextResponse) {
  return local$NextPlugin(request);
}

export async function DELETE(request: NextRequest, response: NextResponse) {
  return local$NextPlugin(request);
}

/**
 * Handling webhooks in production
 */
export async function POST_WEBHOOK(request: NextRequest, response: NextResponse) {
  const headers = Object.fromEntries(request.headers.entries());
  const body = await request.text();

  const webhook = paykit.webhooks
    .setup({ webhookSecret: '123' })
    .on('$customerCreated', async event => {
      console.log({ event });
    })
    .on('$paymentReceived', async e => {
      console.log('Just made a sale!');
    });

  return webhook.handle({ body, headers });
}
