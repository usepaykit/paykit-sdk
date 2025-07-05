import { Checkout, Customer, logger, Subscription } from '@paykit-sdk/core';
import fs from 'fs';
import path from 'path';

const fileName = 'paykit.config.json';

export interface PaykitConfig {
  /**
   * Product info
   */
  product: { name: string; description: string; price: string; itemId: string };

  /**
   * Customer info
   */
  customer: Partial<Customer>;

  /**
   * Subscriptions
   */
  subscriptions: Array<Subscription>;

  /**
   * Checkouts
   */
  checkouts: Array<Checkout>;

  /**
   * Payments
   */
  payments: Array<string>;
}

/**
 * Read the paykit.config.json file from the current working directory
 */
export function readPaykitConfig(): PaykitConfig | null {
  try {
    const configPath = path.resolve(process.cwd(), fileName);

    if (!fs.existsSync(configPath)) {
      logger.warn(`${fileName} not found`);
      return null;
    }

    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData) as PaykitConfig;

    logger.info(`Successfully read ${fileName}`);
    return config;
  } catch (error) {
    logger.error(`Failed to read ${fileName}: ${error}`);
    return null;
  }
}

/**
 * Write the paykit.config.json file to the current working directory
 */
export const writePaykitConfig = (config: PaykitConfig): boolean => {
  try {
    const configPath = path.resolve(process.cwd(), fileName);
    const configData = JSON.stringify(config, null, 2);

    fs.writeFileSync(configPath, configData, 'utf8');
    logger.success(`Successfully wrote ${fileName}`);
    return true;
  } catch (error) {
    logger.error(`Failed to write ${fileName}: ${error}`);
    return false;
  }
};

/**
 * Updates a key in the paykit.config.json file
 */
export const updateKey = <T extends keyof PaykitConfig>(key: T, value: PaykitConfig[T]): boolean => {
  try {
    const config = readPaykitConfig();

    if (!config) {
      logger.error(`Cannot update data: ${fileName} not found`);
      return false;
    }

    config[key] = value;

    const success = writePaykitConfig(config);

    if (success) logger.info(`Updated ${key} data for: ${JSON.stringify(value)}`);

    return success;
  } catch (error) {
    logger.error(`Failed to update data: ${error}`);
    return false;
  }
};

/**
 * Retrieve a key from the paykit.config.json file
 */
export const getKeyValue = <T extends keyof PaykitConfig>(key: T): PaykitConfig[T] | null => {
  try {
    const config = readPaykitConfig();

    if (!config) return null;

    return config[key];
  } catch (error) {
    logger.error(`Failed to get ${key} data: ${error}`);
    return null;
  }
};
