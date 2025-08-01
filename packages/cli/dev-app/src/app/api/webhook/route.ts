import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const webhookUrl = url.searchParams.get('webhookUrl');

    if (!webhookUrl) {
      return NextResponse.json({ error: 'webhookUrl parameter is required' }, { status: 400 });
    }

    const targetUrl = webhookUrl + url.search;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to forward webhook' }, { status: 500 });
  }
}
