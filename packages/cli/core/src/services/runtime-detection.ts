import { tryCatchSync } from '@paykit-sdk/core';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// Type declarations for Deno and Bun
declare global {
  var Deno: any;
  var Bun: any;
}

export interface RuntimeInfo {
  nodeVersion: string | null;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' | null;
  runtime: 'node' | 'deno' | 'bun';
  isCompatible: boolean;
  compatibilityIssues: string[];
}

export class RuntimeDetectionService {
  /**
   * Detect the current runtime environment
   */
  static detect(): RuntimeInfo {
    const runtime = this.detectRuntime();
    const nodeVersion = this.detectNodeVersion();
    const packageManager = this.detectPackageManager();
    const compatibilityIssues = this.checkCompatibility(runtime, nodeVersion, packageManager);

    return {
      nodeVersion,
      packageManager,
      runtime,
      isCompatible: compatibilityIssues.length === 0,
      compatibilityIssues,
    };
  }

  /**
   * Detect the primary runtime being used
   */
  private static detectRuntime(): 'node' | 'deno' | 'bun' {
    if (typeof process !== 'undefined' && process.versions?.node) {
      return 'node';
    }

    if (typeof Deno !== 'undefined') {
      return 'deno';
    }

    if (typeof Bun !== 'undefined') {
      return 'bun';
    }

    // Default to node if we can't detect
    return 'node';
  }

  /**
   * Detect Node.js version if available
   */
  private static detectNodeVersion(): string | null {
    if (typeof process !== 'undefined' && process.versions?.node) {
      return process.versions.node;
    }
    return null;
  }

  /**
   * Detect package manager by checking for lockfiles and package manager files
   */
  private static detectPackageManager(): 'npm' | 'yarn' | 'pnpm' | 'bun' | null {
    const cwd = process.cwd();

    // Check for lockfiles
    if (existsSync(join(cwd, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }

    if (existsSync(join(cwd, 'yarn.lock'))) {
      return 'yarn';
    }

    if (existsSync(join(cwd, 'bun.lockb'))) {
      return 'bun';
    }

    if (existsSync(join(cwd, 'package-lock.json'))) {
      return 'npm';
    }

    // Check for package manager files
    if (existsSync(join(cwd, '.yarnrc.yml')) || existsSync(join(cwd, '.yarnrc'))) {
      return 'yarn';
    }

    if (existsSync(join(cwd, '.npmrc'))) {
      return 'npm';
    }

    // Try to detect from global installation
    try {
      if (this.isPackageManagerAvailable('pnpm')) {
        return 'pnpm';
      }
      if (this.isPackageManagerAvailable('yarn')) {
        return 'yarn';
      }
      if (this.isPackageManagerAvailable('bun')) {
        return 'bun';
      }
      if (this.isPackageManagerAvailable('npm')) {
        return 'npm';
      }
    } catch {
      // Ignore errors
    }

    return null;
  }

  /**
   * Check if a package manager is available globally
   */
  private static isPackageManagerAvailable(manager: string): boolean {
    const [result] = tryCatchSync(() => execSync(`${manager} --version`, { stdio: 'ignore' }));
    return result !== undefined;
  }

  /**
   * Check compatibility and return any issues
   */
  private static checkCompatibility(runtime: string, nodeVersion: string | null, packageManager: string | null): string[] {
    const issues: string[] = [];

    if (runtime === 'node' && nodeVersion) {
      const major = parseInt(nodeVersion.split('.')[0]);
      if (major < 18) {
        issues.push(`Node.js ${nodeVersion} is not supported. Please upgrade to Node.js 18+`);
      }
    }

    if (!packageManager) {
      issues.push('No package manager detected. Please ensure npm, yarn, pnpm, or bun is installed');
    }

    return issues;
  }
}
