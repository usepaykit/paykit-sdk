import { logger } from '@paykit-sdk/core';
import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { ConfigurationService } from './configuration';
import { PackageManagerService } from './package-manager';

export const DEFAULT_PORT = 4242;
export const DEFAULT_HOST = 'localhost';

export interface DevServerStatus {
  port: number | null;
  host: string | null;
  url: string | null;
}

export class DevServerService {
  private packageManager: PackageManagerService;
  private config: ConfigurationService;
  private serverProcess: ChildProcess | null = null;
  private status: DevServerStatus;

  constructor() {
    this.packageManager = new PackageManagerService();
    this.config = new ConfigurationService();
    this.status = { port: null, host: null, url: null };
  }

  /**
   * Start the development server
   */
  async start(): Promise<DevServerStatus> {
    if (!this.config.exists()) {
      throw new Error('PayKit project not initialized. Please run `npx @paykit-sdk/cli init` first.');
    }

    const config = this.config.load();
    const port = config?.devServerPort || DEFAULT_PORT;
    const host = DEFAULT_HOST;

    this.status = { port, host, url: `http://${host}:${port}` };

    // Ensure dependencies are installed
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
      const success = await this.packageManager.installDependencies({
        cwd: devAppPath,
        silent: true,
      });

      if (!success) {
        throw new Error('Failed to install development dependencies');
      }
    }
  }

  private async startServer(port: number, host: string): Promise<void> {
    const devAppPath = this.findDevAppPath();

    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('npm', ['start'], {
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
    const cwd = process.cwd();

    const projectDevAppPath = join(cwd, 'node_modules', '@paykit-sdk', 'cli', 'dist', 'dev-app');

    if (existsSync(projectDevAppPath)) {
      return projectDevAppPath;
    }

    throw new Error('Could not locate dev-app directory. Please ensure the CLI is properly installed.');
  }
}
