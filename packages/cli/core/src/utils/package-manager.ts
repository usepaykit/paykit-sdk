/**
 * Simple package manager detection and utility functions
 * Uses npm_config_user_agent environment variable for reliable detection
 */

/**
 * Get the package manager runner command (e.g., "npx", "pnpm dlx", "yarn dlx", "bunx")
 */
export function getPackageManagerRunner(): string {
  const userAgent = process.env.npm_config_user_agent || '';

  if (userAgent.startsWith('bun')) {
    return 'bunx';
  } else if (userAgent.startsWith('pnpm')) {
    return 'pnpm dlx';
  } else if (userAgent.startsWith('yarn')) {
    return 'yarn dlx';
  } else {
    return 'npx';
  }
}

/**
 * Get the package manager install command (e.g., "npm", "pnpm", "yarn", "bun")
 */
export function getPackageManagerInstall(): string {
  const userAgent = process.env.npm_config_user_agent || '';

  if (userAgent.startsWith('bun')) {
    return 'bun';
  } else if (userAgent.startsWith('pnpm')) {
    return 'pnpm';
  } else if (userAgent.startsWith('yarn')) {
    return 'yarn';
  } else {
    return 'npm';
  }
}

/**
 * Get the package manager start command (e.g., "npm start", "pnpm start", "yarn start", "bun start")
 */
export function getPackageManagerStart(): string {
  const userAgent = process.env.npm_config_user_agent || '';

  if (userAgent.startsWith('bun')) {
    return 'bun start';
  } else if (userAgent.startsWith('pnpm')) {
    return 'pnpm start';
  } else if (userAgent.startsWith('yarn')) {
    return 'yarn start';
  } else {
    return 'npm start';
  }
}
