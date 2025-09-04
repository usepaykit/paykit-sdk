#!/usr/bin/env node
import { logger, safeParse } from '@paykit-sdk/core';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read the dev-app's package.json
const devAppPackagePath = join(__dirname, '../dev-app/package.json');
const devAppPackage = safeParse(readFileSync(devAppPackagePath, 'utf8'), JSON.parse, 'Invalid dev-app package.json');

if (!devAppPackage.ok) {
  logger.error(devAppPackage.error.message);
  process.exit(1);
}

// Extract only the dependencies (not devDependencies)
const dependencies = devAppPackage.value.dependencies || {};

// Create the production package.json
const prodPackage = {
  name: devAppPackage.value.name,
  version: devAppPackage.value.version,
  private: devAppPackage.value.private,
  scripts: {
    start: devAppPackage.value.scripts.start,
  },
  dependencies,
};

// Write the production package.json
const distPath = join(__dirname, '../dist/dev-app/package.json');
writeFileSync(distPath, JSON.stringify(prodPackage, null, 2));

// Create the root package.json for the dist directory
const rootPackage = {
  type: 'module',
};

const rootPackagePath = join(__dirname, '../dist/package.json');
writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2));

logger.info(`Production package.json created successfully: ${distPath}`);
logger.info(`Dependencies included: ${Object.keys(dependencies).length}`);
