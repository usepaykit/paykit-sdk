import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { nanoid } from 'nanoid';
import { join } from 'path';

export interface PaykitConfig {
  project: { name: string; description?: string; price: string; itemId: string };
  customer: { id: string; name: string; email?: string; metadata: Record<string, any> };
  runtime?: { packageManager?: string; nodeVersion?: string };
  devServer?: { port: number; host: string; autoOpen: boolean };
  subscriptions: any[];
  checkouts: any[];
  invoices: any[];
}

export class ConfigurationService {
  private configPath: string;
  private config: PaykitConfig | null = null;

  constructor(projectRoot: string = process.cwd()) {
    this.configPath = join(projectRoot, '.paykit', 'config.json');
  }

  /**
   * Load configuration from file
   */
  load(): PaykitConfig | null {
    if (this.config) {
      return this.config;
    }

    if (!existsSync(this.configPath)) {
      return null;
    }

    try {
      const content = readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(content);
      return this.config;
    } catch (error) {
      console.error('Failed to load PayKit configuration:', error);
      return null;
    }
  }

  /**
   * Save configuration to file
   */
  save(config: PaykitConfig): boolean {
    try {
      const dir = join(this.configPath, '..');
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      this.config = config;
      return true;
    } catch (error) {
      console.error('Failed to save PayKit configuration:', error);
      return false;
    }
  }

  /**
   * Create default configuration
   */
  createDefault(productName: string, customerName: string, price: string, description?: string, customerEmail?: string): PaykitConfig {
    return {
      project: { name: productName, description, price, itemId: `it_${nanoid(30)}` },
      customer: { id: `cus_${nanoid(30)}`, name: customerName, email: customerEmail, metadata: {} },
      devServer: { port: 3001, host: 'localhost', autoOpen: false },
      subscriptions: [],
      checkouts: [],
      invoices: [],
    };
  }

  /**
   * Update configuration partially
   */
  update(updates: Partial<PaykitConfig>): boolean {
    const current = this.load();

    if (!current) return false;

    const updated = { ...current, ...updates };
    return this.save(updated);
  }

  /**
   * Check if configuration exists
   */
  exists(): boolean {
    return existsSync(this.configPath);
  }

  /**
   * Get configuration directory path
   */
  getConfigDir(): string {
    return join(this.configPath, '..');
  }

  /**
   * Validate configuration
   */
  validate(config: PaykitConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.project?.name) {
      errors.push('Project name is required');
    }

    if (!config.project?.price) {
      errors.push('Project price is required');
    }

    if (!config.customer?.name) {
      errors.push('Customer name is required');
    }

    if (!config.customer?.email) {
      errors.push('Customer email is required');
    }

    return { isValid: errors.length === 0, errors };
  }
}
