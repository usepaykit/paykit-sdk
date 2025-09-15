import { logger } from '@paykit-sdk/core';
import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { createRequire } from 'module';
import { join, dirname } from 'path';
import { getPackageManagerInstall, getPackageManagerRunner, getPackageManagerStart } from '../utils/package-manager';
import { ConfigurationService } from './configuration';

export const DEFAULT_PORT = 4242;
export const DEFAULT_HOST = 'localhost';

const INVALID_CONFIG_ERROR = `PayKit is not initialized. Please run \`${getPackageManagerRunner()} @paykit-sdk/cli init\` first.`;

export interface DevServerStatus {
  port: number | null;
  host: string | null;
  url: string | null;
}

export class DevServerService {
  private config: ConfigurationService;
  private serverProcess: ChildProcess | null = null;
  private status: DevServerStatus;

  constructor() {
    this.config = new ConfigurationService();
    this.status = { port: null, host: null, url: null };
  }

  /**
   * Start the development server
   */
  async start(): Promise<DevServerStatus> {
    if (!this.config.exists()) throw new Error(INVALID_CONFIG_ERROR);

    const config = this.config.load();
    const port = config?.devServerPort || DEFAULT_PORT;
    const host = DEFAULT_HOST;

    this.status = { port, host, url: `http://${host}:${port}` };

    await this.ensureDependencies();

    // Start the server
    await this.startServer(port, host);

    return this.status;
  }

  /**
   * Stop the development server
   */
  stop(): boolean {
    if (!this.serverProcess) return false;

    try {
      this.serverProcess.kill('SIGTERM');
      this.serverProcess = null;
      return true;
    } catch (error) {
      console.error('Failed to stop server:', error);
      return false;
    }
  }

  private async ensureDependencies(): Promise<void> {
    // Find the CLI installation directory and locate dev-app
    const devAppPath = this.findDevAppPath();

    if (!existsSync(join(devAppPath, 'node_modules'))) {
      logger.progressIndicator('Installing development dependencies...');
      const success = await this.installDependencies(devAppPath);

      if (!success) {
        throw new Error('Failed to install development dependencies');
      }
    }
  }

  private async installDependencies(cwd: string): Promise<boolean> {
    const packageManager = getPackageManagerInstall();

    return new Promise(resolve => {
      const installProcess = spawn(packageManager, ['install'], {
        cwd,
        stdio: 'ignore',
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

  private async startServer(port: number, host: string): Promise<void> {
    const devAppPath = this.findDevAppPath();
    const startCommand = getPackageManagerStart();
    const [command, ...args] = startCommand.split(' ');

    return new Promise((resolve, reject) => {
      this.serverProcess = spawn(command, args, {
        cwd: devAppPath,
        stdio: 'pipe',
        env: { ...process.env, PORT: port.toString(), HOST: host },
      });

      let serverReady = false;
      const timeout = setTimeout(() => {
        if (!serverReady) {
          reject(new Error('Server startup timeout'));
        }
      }, 30000);

      this.serverProcess.stdout?.on('data', data => {
        const output = data.toString();

        if (output.includes('Ready') || output.includes('Local:') || output.includes(`localhost:${port}`)) {
          if (!serverReady) {
            serverReady = true;
            clearTimeout(timeout);
            resolve();
          }
        }
      });

      this.serverProcess.stderr?.on('data', data => {
        const error = data.toString();
        if (error.includes('Error') || error.includes('Failed')) {
          console.error('Server error:', error);
        }
      });

      this.serverProcess.on('close', code => {
        if (code !== 0) {
          reject(new Error(`Server process exited with code ${code}`));
        }
      });

      this.serverProcess.on('error', error => {
        reject(new Error(`Failed to start server: ${error.message}`));
      });
    });
  }

  private findDevAppPath(): string {
    const require = createRequire(import.meta.url);

    const devAppPackageJsonPath = require.resolve('@paykit-sdk/cli/dist/dev-app/package.json');

    console.log('devAppPackageJsonPath', devAppPackageJsonPath);

    return dirname(devAppPackageJsonPath);
  }
}
