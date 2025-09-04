import { Subscription, Checkout, Invoice } from '@paykit-sdk/core';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { nanoid } from 'nanoid';
import { join } from 'path';
import { PaykitConfig } from '../schema';

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
    if (this.config) return this.config;

    if (!existsSync(this.configPath)) return null;

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

      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      writeFileSync(this.configPath, JSON.stringify(config, null, 2));

      this.config = config;
      return true;
    } catch (error) {
      console.error('Failed to save PayKit configuration:', error);
      return false;
    }
  }

  createDefault(
    productName: string,
    productDescription: string,
    productPrice: string,
    productCurrency: string,
    customerName: string,
    customerEmail: string,
    devServerPort: number,
  ): PaykitConfig {
    return {
      product: { name: productName, description: productDescription, price: productPrice, currency: productCurrency },
      customer: { id: `cus_${nanoid(30)}`, name: customerName, email: customerEmail, metadata: {} },
      devServerPort: devServerPort,
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
}
