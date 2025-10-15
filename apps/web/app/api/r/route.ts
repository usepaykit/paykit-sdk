import registryIndex from '@paykit-sdk/registry';
import { NextResponse } from 'next/server';

/**
 * Forever cached route
 */
export const revalidate = false;

export async function GET() {
  return NextResponse.json(registryIndex, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
