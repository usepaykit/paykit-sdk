import registryIndex from '@paykit-sdk/registry';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  const { name } = params;

  // Find the item in the registry
  const item = registryIndex.items.find(i => i.name === name);

  if (!item) {
    return NextResponse.json(
      {
        error: 'Not Found',
        message: `Registry item "${name}" not found. Available items: ${registryIndex.items.map(i => i.name).join(', ')}`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json(item, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

export async function OPTIONS() {
  const items = registryIndex.items.map(({ name, description, type, meta }) => ({ name, description, type, meta }));

  return NextResponse.json(
    { registry: registryIndex.name, homepage: registryIndex.homepage, items },
    {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=3600' },
    },
  );
}
