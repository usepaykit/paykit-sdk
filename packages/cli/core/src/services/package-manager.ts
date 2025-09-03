import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { RuntimeDetectionService } from './runtime-detection';

export interface PackageManagerInfo {
  name: 'npm' | 'yarn' | 'pnpm' | 'bun';
  version: string;
  isAvailable: boolean;
  lockfilePath: string | null;
}

export interface InstallOptions {
  cwd: string;
  silent?: boolean;
  force?: boolean;
}

export class PackageManagerService {
  private packageManager: PackageManagerInfo;

  constructor() {
    this.packageManager = this.detectPackageManager();
  }

  /**
   * Get package manager information
   */
  getInfo(): PackageManagerInfo {
    return this.packageManager;
  }

  /**
   * Install dependencies in the specified directory
   */
  async installDependencies(options: InstallOptions): Promise<boolean> {
    const { cwd, silent = false, force = false } = options;

    if (!this.packageManager.isAvailable) {
      throw new Error(`Package manager ${this.packageManager.name} is not available`);
    }

    const command = this.getInstallCommand(force);
    const args = this.getInstallArgs(force);

    return new Promise(resolve => {
      const installProcess = spawn(command, args, {
        cwd,
        stdio: silent ? 'ignore' : 'pipe',
        shell: true,
      });

      installProcess.on('close', code => {
        resolve(code === 0);
      });

      installProcess.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Get the install command for the detected package manager
   */
  private getInstallCommand(force: boolean): string {
    switch (this.packageManager.name) {
      case 'npm':
        return 'npm';
      case 'yarn':
        return 'yarn';
      case 'pnpm':
        return 'pnpm';
      case 'bun':
        return 'bun';
      default:
        return 'npm';
    }
  }

  /**
   * Get install arguments for the detected package manager
   */
  private getInstallArgs(force: boolean): string[] {
    switch (this.packageManager.name) {
      case 'npm':
        return force ? ['install', '--force'] : ['install'];
      case 'yarn':
        return ['install'];
      case 'pnpm':
        return ['install'];
      case 'bun':
        return ['install'];
      default:
        return ['install'];
    }
  }

  /**
   * Detect package manager and get detailed information
   */
  private detectPackageManager(): PackageManagerInfo {
    const runtime = RuntimeDetectionService.detect();
    const detectedManager = runtime.packageManager || 'npm';

    let version = 'unknown';
    let isAvailable = false;
    let lockfilePath = null;

    try {
      // Get version
      const output = execSync(`${detectedManager} --version`, { encoding: 'utf8' });
      version = output.trim();
      isAvailable = true;
    } catch {
      isAvailable = false;
    }

    // Find lockfile
    const cwd = process.cwd();
    const lockfiles = {
      npm: 'package-lock.json',
      yarn: 'yarn.lock',
      pnpm: 'pnpm-lock.yaml',
      bun: 'bun.lockb',
    };

    const lockfile = lockfiles[detectedManager];
    if (lockfile && existsSync(join(cwd, lockfile))) {
      lockfilePath = join(cwd, lockfile);
    }

    return {
      name: detectedManager,
      version,
      isAvailable,
      lockfilePath,
    };
  }

  /**
   * Check if dependencies are installed in a directory
   */
  isDependenciesInstalled(cwd: string): boolean {
    return existsSync(join(cwd, 'node_modules'));
  }

  /**
   * Get package.json from a directory
   */
  getPackageJson(cwd: string): any {
    const packagePath = join(cwd, 'package.json');
    if (!existsSync(packagePath)) {
      return null;
    }

    try {
      const content = readFileSync(packagePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
}
