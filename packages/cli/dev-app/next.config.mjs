import path from 'path';
import { fileURLToPath } from 'url';

// Replicates __dirname behavior in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    '/*': ['./node_modules/@paykit-sdk/ui/dist/**/*.css'],
  },
};

export default nextConfig;
