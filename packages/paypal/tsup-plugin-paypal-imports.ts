import type { Plugin } from 'esbuild';
import { readFileSync } from 'fs';

/**
 * Esbuild plugin to transform PayPal SDK imports from dist/types to dist/cjs in source code.
 * This allows TypeScript to use type-safe imports while ensuring runtime works.
 */
export function paypalImportTransformer(): Plugin {
  return {
    name: 'paypal-import-transformer',
    setup(build) {
      // Transform source code before parsing to rewrite imports
      build.onLoad({ filter: /\.ts$/, namespace: 'file' }, async args => {
        let contents = readFileSync(args.path, 'utf-8');

        // Replace dist/types with dist/cjs in import/export statements (ESM)
        contents = contents.replace(
          /from ['"]@paypal\/paypal-server-sdk\/dist\/types\/([^'"]+)['"]/g,
          "from '@paypal/paypal-server-sdk/dist/cjs/$1'",
        );

        // Replace dist/types with dist/cjs in require statements (CJS)
        contents = contents.replace(
          /require\(['"]@paypal\/paypal-server-sdk\/dist\/types\/([^'"]+)['"]\)/g,
          "require('@paypal/paypal-server-sdk/dist/cjs/$1')",
        );

        return {
          contents,
          loader: 'ts',
        };
      });
    },
  };
}
