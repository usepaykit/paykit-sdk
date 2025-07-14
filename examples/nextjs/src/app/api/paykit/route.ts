import { ValidationError } from '@paykit-sdk/core';
import { LocalServer } from '@paykit-sdk/local/server';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the local server
const localServer = new LocalServer({
  paymentUrl: process.env.PAYKIT_PAYMENT_URL || 'http://localhost:3000/checkout',
  baseUrl: process.env.PAYKIT_BASE_URL || 'http://localhost:3000',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');
    const id = searchParams.get('id');

    if (!resource) {
      return NextResponse.json({ error: 'Resource type is required' }, { status: 400 });
    }

    switch (resource) {
      case 'customer':
        if (!id) {
          return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
        }
        const customer = await localServer.retrieveCustomer(id);
        return NextResponse.json({ data: customer });

      case 'subscription':
        if (!id) {
          return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
        }
        const subscription = await localServer.retrieveSubscription(id);
        return NextResponse.json({ data: subscription });

      case 'checkout':
        if (!id) {
          return NextResponse.json({ error: 'Checkout ID is required' }, { status: 400 });
        }
        const checkout = await localServer.retrieveCheckout(id);
        return NextResponse.json({ data: checkout });

      default:
        return NextResponse.json({ error: 'Unknown resource type' }, { status: 400 });
    }
  } catch (error) {
    console.error('GET Error:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resource, ...params } = body;

    if (!resource) {
      return NextResponse.json({ error: 'Resource type is required' }, { status: 400 });
    }

    switch (resource) {
      case 'customer':
        const customer = await localServer.createCustomer(params);
        return NextResponse.json({ data: customer });

      case 'checkout':
        const checkout = await localServer.createCheckout(params);
        return NextResponse.json({ data: checkout });

      case 'webhook':
        const webhookResult = await localServer.handleWebhook({
          body: JSON.stringify(params),
          headers: request.headers,
        });
        return NextResponse.json({ data: webhookResult });

      default:
        return NextResponse.json({ error: 'Unknown resource type' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST Error:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { resource, id, ...params } = body;

    if (!resource || !id) {
      return NextResponse.json({ error: 'Resource type and ID are required' }, { status: 400 });
    }

    switch (resource) {
      case 'customer':
        const customer = await localServer.updateCustomer(id, params);
        return NextResponse.json({ data: customer });

      case 'subscription':
        const subscription = await localServer.updateSubscription(id, params);
        return NextResponse.json({ data: subscription });

      default:
        return NextResponse.json({ error: 'Unknown resource type' }, { status: 400 });
    }
  } catch (error) {
    console.error('PUT Error:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');
    const id = searchParams.get('id');

    if (!resource || !id) {
      return NextResponse.json({ error: 'Resource type and ID are required' }, { status: 400 });
    }

    switch (resource) {
      case 'subscription':
        const subscription = await localServer.cancelSubscription(id);
        return NextResponse.json({ data: subscription });

      default:
        return NextResponse.json({ error: 'Unknown resource type' }, { status: 400 });
    }
  } catch (error) {
    console.error('DELETE Error:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
