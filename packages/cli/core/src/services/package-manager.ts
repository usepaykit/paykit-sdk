import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface InstallOptions {
  cwd: string;
  silent?: boolean;
  force?: boolean;
}

export class PackageManagerService {
  private packageManager: PackageManager | null;

  constructor() {
    this.packageManager = this.detectPackageManager();
  }

  /**
   * Get package manager information
   */
  getInfo(): PackageManager | null {
    return this.packageManager;
  }

  /**
   * Install dependencies in the specified directory
   */
  async installDependencies(options: InstallOptions): Promise<boolean> {
    const { cwd, silent = false, force = false } = options;

    if (!this.packageManager) {
      throw new Error('No package manager detected');
    }

    const command = this.packageManager;
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
   * Get install arguments for the detected package manager
   */
  private getInstallArgs(force: boolean): string[] {
    switch (this.packageManager) {
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
  private detectPackageManager(): PackageManager | null {
    const cwd = process.cwd();

    const lockfiles: { [key: string]: PackageManager } = {
      'pnpm-lock.yaml': 'pnpm',
      'yarn.lock': 'yarn',
      'bun.lockb': 'bun',
      'package-lock.json': 'npm',
    };

    for (const file in lockfiles) {
      if (existsSync(join(cwd, file))) {
        return lockfiles[file];
      }
    }

    return null;
  }
}
