import registryIndex from '@paykit-sdk/registry';
import { readFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export const revalidate = false;

const REGISTRY_DIR = join(process.cwd(), '../../packages/registry');

const CACHE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
} as const;

/**
 * Enriches a registry item's files with their content
 */
async function enrichItemWithFileContents<T extends { files: Array<{ path: string }> }>(
  item: T,
): Promise<T & { files: Array<{ path: string; content: string }> }> {
  const filesWithContent = await Promise.all(
    item.files.map(async file => {
      try {
        const filePath = join(REGISTRY_DIR, file.path);
        const content = await readFile(filePath, 'utf-8');
        return { ...file, content };
      } catch (error) {
        console.error(`Failed to read file ${file.path}:`, error);
        return { ...file, content: '' };
      }
    }),
  );

  return { ...item, files: filesWithContent };
}

/**
 * Enriches all registry items with their file contents
 */
async function enrichRegistryIndexWithFiles() {
  const itemsWithContent = await Promise.all(
    registryIndex.items.map(item => enrichItemWithFileContents(item)),
  );

  return { ...registryIndex, items: itemsWithContent };
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const fullPath = path.join('/');

  // Handle `/r/registries.json` as an alias for `/r` with file contents
  if (fullPath === 'registries.json') {
    const enriched = await enrichRegistryIndexWithFiles();
    return NextResponse.json(enriched, { headers: CACHE_HEADERS });
  }

  // If it's a simple name (no slashes), return registry metadata with file contents
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

    const enriched = await enrichItemWithFileContents(item);
    return NextResponse.json(enriched, { headers: CACHE_HEADERS });
  }

  // Otherwise, serve the actual file
  try {
    const filePath = join(REGISTRY_DIR, fullPath);
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
