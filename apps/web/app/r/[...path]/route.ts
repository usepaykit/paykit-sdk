import registryIndex from '@paykit-sdk/registry';
import { readFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export const revalidate = false;

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const fullPath = path.join('/');

  // If it's a simple name (no slashes), return registry metadata
  if (path.length === 1) {
    const item = registryIndex.items.find(i => i.name === fullPath);

    if (!item) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: `Registry item "${fullPath}" not found. Available items: ${registryIndex.items.map(i => i.name).join(', ')}`,
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

  // Otherwise, serve the actual file
  try {
    const registryDir = join(process.cwd(), '../../packages/registry');
    const filePath = join(registryDir, fullPath);
    const content = await readFile(filePath, 'utf-8');

    const ext = fullPath.split('.').pop();
    const contentType =
      ext === 'tsx' || ext === 'ts' ? 'text/plain; charset=utf-8' : 'text/plain';

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'File Not Found',
        message: `Could not read file: ${fullPath}`,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 404 },
    );
  }
}

export async function OPTIONS() {
  const items = registryIndex.items.map(({ name, description, type, meta }) => ({
    name,
    description,
    type,
    meta,
  }));

  return NextResponse.json(
    { registry: registryIndex.name, homepage: registryIndex.homepage, items },
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600',
      },
    },
  );
}
