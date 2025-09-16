import { LifetimeAccessEmail } from '@/components/lifetime-access-email-template';
import { paykit } from '@/lib/paykit';
import { resend } from '@/lib/resend';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
  try {
    const webhook = paykit.webhooks
      .setup({ webhookSecret: process.env.POLAR_WEBHOOK_SECRET! })
      .on('$customerCreated', async customer => {
        console.log({ customer });
      })
      .on('$invoicePaid', async invoice => {
        const email = invoice.data.custom_fields?.['account-email'] as string;

        const { error } = await resend.emails.send({
          from: 'PayKit <odii@usepaykit.dev>',
          to: email,
          subject: 'PayKit Lifetime Access',
          react: LifetimeAccessEmail(),
        });

        if (error) throw error;
      });

    const headers = Object.fromEntries(request.headers.entries());
    const body = await request.text();
    await webhook.handle({ body, headers });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
};
