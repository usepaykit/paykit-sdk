import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { ConfigurationService } from './configuration';
import { PackageManagerService } from './package-manager';

export interface DevServerOptions {
  port?: number;
  host?: string;
  autoOpen?: boolean;
}

export interface DevServerStatus {
  isRunning: boolean;
  port: number;
  host: string;
  url: string;
  processId?: number;
}

export class DevServerService {
  private packageManager: PackageManagerService;
  private config: ConfigurationService;
  private serverProcess: ChildProcess | null = null;
  private status: DevServerStatus;

  constructor() {
    this.packageManager = new PackageManagerService();
    this.config = new ConfigurationService();
    this.status = {
      isRunning: false,
      port: 3001,
      host: 'localhost',
      url: `http://localhost:3001`,
    };
  }

  /**
   * Start the development server
   */
  async start(options: DevServerOptions = {}): Promise<DevServerStatus> {
    if (this.status.isRunning) {
      throw new Error('Development server is already running');
    }

    const config = this.config.load();
    const port = options.port || config?.devServer?.port || 3001;
    const host = options.host || config?.devServer?.host || 'localhost';

    this.status = { isRunning: false, port, host, url: `http://${host}:${port}` };

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
    if (!this.serverProcess || !this.status.isRunning) {
      return false;
    }

    try {
      this.serverProcess.kill('SIGTERM');
      this.serverProcess = null;
      this.status.isRunning = false;
      return true;
    } catch (error) {
      console.error('Failed to stop server:', error);
      return false;
    }
  }

  /**
   * Get current server status
   */
  getStatus(): DevServerStatus {
    return { ...this.status };
  }

  /**
   * Ensure dependencies are installed
   */
  private async ensureDependencies(): Promise<void> {
    const devAppPath = join(__dirname, '..', '..', 'dev-app');

    if (!this.packageManager.isDependenciesInstalled(devAppPath)) {
      console.log('Installing development dependencies...');
      const success = await this.packageManager.installDependencies({
        cwd: devAppPath,
        silent: true,
      });

      if (!success) {
        throw new Error('Failed to install development dependencies');
      }
    }
  }

  /**
   * Start the Next.js development server
   */
  private async startServer(port: number, host: string): Promise<void> {
    const devAppPath = join(__dirname, '..', '..', 'dev-app');

    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('npm', ['start'], {
        cwd: devAppPath,
        stdio: 'pipe',
        env: {
          ...process.env,
          PORT: port.toString(),
          HOST: host,
        },
      });

      let serverReady = false;
      const timeout = setTimeout(() => {
        if (!serverReady) {
          reject(new Error('Server startup timeout'));
        }
      }, 30000); // 30 second timeout

      this.serverProcess.stdout?.on('data', data => {
        const output = data.toString();

        if (output.includes('Ready') || output.includes('Local:') || output.includes(`localhost:${port}`)) {
          if (!serverReady) {
            serverReady = true;
            clearTimeout(timeout);
            this.status.isRunning = true;
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
          this.status.isRunning = false;
          reject(new Error(`Server process exited with code ${code}`));
        }
      });

      this.serverProcess.on('error', error => {
        this.status.isRunning = false;
        reject(new Error(`Failed to start server: ${error.message}`));
      });
    });
  }
}
