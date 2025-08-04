import { Checkout, Customer, Invoice, logger, Subscription } from '@paykit-sdk/core';

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
  customer: Customer;

  /**
   * Subscriptions
   */
  subscriptions: Array<Subscription>;

  /**
   * Checkouts
   */
  checkouts: Array<Checkout>;

  /**
   * Invoices
   */
  invoices: Array<Invoice>;
}

/**
 * Lazy load Node.js modules to avoid bundling them for browser
 */
const getNodeModules = async () => {
  // Use dynamic imports for ESM compatibility
  const fs = await import('fs');
  const path = await import('path');

  return { fs, path };
};

/**
 *  Helper to get the full config path and ensure directory exists
 */
const getConfigPath = async () => {
  const { fs, path } = await getNodeModules();
  const dirPath = path.resolve(process.cwd(), configDir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  return path.join(dirPath, fileName);
};

/**
 * Read the .paykit/config.json file from the current working directory
 */
export async function readPaykitConfig(): Promise<PaykitConfig | null> {
  try {
    const { fs } = await getNodeModules();
    const configPath = await getConfigPath();

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
export const writePaykitConfig = async (config: PaykitConfig): Promise<boolean> => {
  try {
    const { fs } = await getNodeModules();
    const configPath = await getConfigPath();
    const configData = JSON.stringify(config, null, 2);

    fs.writeFileSync(configPath, configData, 'utf8');
    logger.success(`Successfully wrote ${configDir}/${fileName}`);
    return true;
  } catch (error) {
    logger.error(`Failed to write ${configDir}/${fileName}: ${error}`);
    return false;
  }
};

export const __defaultPaykitConfig = (dto: Partial<PaykitConfig> | null = null) => {
  const defaultConfig: PaykitConfig = {
    product: { name: '', description: '', price: '', itemId: '' },
    customer: { id: '', email: '', name: '', metadata: {} },
    subscriptions: [],
    checkouts: [],
    invoices: [],
  };

  return dto ? { ...defaultConfig, ...dto } : defaultConfig;
};

/**
 * Updates a key in the .paykit/config.json file
 */
export const updateKey = async <T extends keyof PaykitConfig>(key: T, value: PaykitConfig[T]): Promise<boolean> => {
  try {
    let config = await readPaykitConfig();

    if (!config) config = __defaultPaykitConfig();

    config[key] = value;

    const success = await writePaykitConfig(config);

    return success;
  } catch (error) {
    logger.error(`Failed to update data: ${error}`);
    return false;
  }
};

/**
 * Retrieve a key from the .paykit/config.json file
 */
export const getKeyValue = async <T extends keyof PaykitConfig>(key: T): Promise<PaykitConfig[T] | null> => {
  try {
    const config = await readPaykitConfig();

    if (!config) return null;

    return config[key];
  } catch (error) {
    logger.error(`Failed to get ${key} data: ${error}`);
    return null;
  }
};
