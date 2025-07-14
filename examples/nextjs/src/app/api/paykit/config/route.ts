import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { resolve, join } from 'path';

const configDir = '.paykit';
const fileName = 'config.json';

interface PaykitConfig {
  product: { name: string; description: string; price: string; itemId: string };
  customer: any;
  subscriptions: Array<any>;
  checkouts: Array<any>;
  payments: Array<string>;
}

const getConfigPath = () => {
  const dirPath = resolve(process.cwd(), configDir);
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
  return join(dirPath, fileName);
};

const readPaykitConfig = (): PaykitConfig | null => {
  try {
    const configPath = getConfigPath();

    if (!existsSync(configPath)) {
      return null;
    }

    const configData = readFileSync(configPath, 'utf8');
    return JSON.parse(configData) as PaykitConfig;
  } catch (error) {
    console.error('Failed to read paykit config:', error);
    return null;
  }
};

const writePaykitConfig = (config: PaykitConfig): boolean => {
  try {
    const configPath = getConfigPath();
    const configData = JSON.stringify(config, null, 2);
    writeFileSync(configPath, configData, 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to write paykit config:', error);
    return false;
  }
};

// GET /api/paykit/config - Read entire config
// GET /api/paykit/config?key=customer - Read specific key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    let config = readPaykitConfig();

    if (!config) {
      // Create default config if it doesn't exist
      config = {
        product: { name: '', description: '', price: '', itemId: '' },
        customer: {},
        subscriptions: [],
        checkouts: [],
        payments: [],
      };
      writePaykitConfig(config);
    }

    if (key) {
      return NextResponse.json({
        success: true,
        data: config[key as keyof PaykitConfig] || null,
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read config',
      },
      { status: 500 },
    );
  }
}

// POST /api/paykit/config - Update config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    let config = readPaykitConfig();

    if (!config) {
      config = {
        product: { name: '', description: '', price: '', itemId: '' },
        customer: {},
        subscriptions: [],
        checkouts: [],
        payments: [],
      };
    }

    if (key) {
      // Update specific key
      config[key as keyof PaykitConfig] = value;
    } else {
      // Update entire config
      config = { ...config, ...body };
    }

    const success = writePaykitConfig(config);

    if (success) {
      return NextResponse.json({
        success: true,
        data: config,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to write config',
        },
        { status: 500 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update config',
      },
      { status: 500 },
    );
  }
}
