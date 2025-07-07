import { Checkout, Customer, logger, Subscription } from '@paykit-sdk/core';

const configDir = '.paykit';
const fileName = 'config.json';

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
 * Lazy load Node.js modules to avoid bundling them for browser
 */
const getNodeModules = () => {
  // Dynamic imports to avoid bundling in browser
  const fs = require('fs');
  const path = require('path');
  
  return { fs, path };
};

/**
 *  Helper to get the full config path and ensure directory exists
 */
const getConfigPath = () => {
  const { fs, path } = getNodeModules();
  const dirPath = path.resolve(process.cwd(), configDir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  return path.join(dirPath, fileName);
};

/**
 * Read the .paykit/config.json file from the current working directory
 */
export function readPaykitConfig(): PaykitConfig | null {
  try {
    const { fs } = getNodeModules();
    const configPath = getConfigPath();

    if (!fs.existsSync(configPath)) {
      logger.warn(`${configDir}/${fileName} not found`);
      return null;
    }

    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData) as PaykitConfig;

    logger.info(`Successfully read ${configDir}/${fileName}`);
    return config;
  } catch (error) {
    logger.error(`Failed to read ${configDir}/${fileName}: ${error}`);
    return null;
  }
}

/**
 * Write the .paykit/config.json file to the current working directory
 */
export const writePaykitConfig = (config: PaykitConfig): boolean => {
  try {
    const { fs } = getNodeModules();
    const configPath = getConfigPath();
    const configData = JSON.stringify(config, null, 2);

    fs.writeFileSync(configPath, configData, 'utf8');
    logger.success(`Successfully wrote ${configDir}/${fileName}`);
    return true;
  } catch (error) {
    logger.error(`Failed to write ${configDir}/${fileName}: ${error}`);
    return false;
  }
};

/**
 * Updates a key in the .paykit/config.json file
 */
export const updateKey = <T extends keyof PaykitConfig>(key: T, value: PaykitConfig[T]): boolean => {
  try {
    let config = readPaykitConfig();

    if (!config) {
      // Create a default config if it doesn't exist
      config = {
        product: { name: '', description: '', price: '', itemId: '' },
        customer: {},
        subscriptions: [],
        checkouts: [],
        payments: []
      };
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
 * Retrieve a key from the .paykit/config.json file
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
