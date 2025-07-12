#!/usr/bin/env node
import { safeEncode, ValidationError, logger } from '@paykit-sdk/core';
import { CheckoutInfo, writePaykitConfig } from '@paykit-sdk/local';
import { spawn } from 'child_process';
import { Command } from 'commander';
import { existsSync } from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program.name('@paykit-sdk/cli').description('PayKit CLI for product setup and development').version('1.1.0-alpha.4');

program
  .command('init')
  .description('Initialize your product info for PayKit')
  .action(async () => {
    logger.brand();
    logger.info("Welcome to PayKit! Let's set up your product.");
    logger.spacer();

    const answers = (await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Product name:',
        validate: (input: string) => (input ? true : 'Product name is required'),
      },
      {
        type: 'input',
        name: 'description',
        message: 'Product description (optional):',
      },
      {
        type: 'input',
        name: 'price',
        message: 'Product price (e.g. $10):',
        validate: (input: string) => (input ? true : 'Product price is required'),
      },
      {
        type: 'input',
        name: 'customerName',
        message: 'Default customer name:',
        validate: (input: string) => (input ? true : 'Customer name is required'),
      },
      {
        type: 'input',
        name: 'customerEmail',
        message: 'Default customer email (optional):',
        validate: (input: string) => {
          if (!input) return true; // Optional field
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(input) ? true : 'Please enter a valid email address';
        },
      },
    ])) as CheckoutInfo;

    logger.progress('Validating product info');

    const itemId = safeEncode<CheckoutInfo>(answers);
    const customerId = safeEncode<string>(answers.customerEmail);

    logger.clearProgress();

    if (!customerId.ok) throw new ValidationError('Invalid customer email', customerId.error);
    if (!itemId.ok) throw new ValidationError('Invalid product info', itemId.error);

    const product = { name: answers.name, description: answers.description, price: answers.price, itemId: itemId.value };
    const customer = { id: customerId.value, name: answers.customerName, email: answers.customerEmail, metadata: {} };

    const response = await writePaykitConfig({ product, customer, subscriptions: [], checkouts: [], payments: [] });

    if (!response) return;

    logger.spacer();
    logger.success('PayKit configuration initialized successfully!');
    logger.tip('Run `paykit dev` to start the development server');
  });

program
  .command('dev')
  .description('Start the PayKit development server')
  .action(async () => {
    logger.brand();
    logger.info('Starting PayKit development server...');
    logger.spacer();

    // Path to the built dev-app directory (same directory as this compiled CLI file)
    const devAppPath = path.join(__dirname, 'dev-app');
    const nodeModulesPath = path.join(devAppPath, 'node_modules');

    // Check if dependencies are installed
    if (!existsSync(nodeModulesPath)) {
      logger.progress('Installing development dependencies (first time setup)...');

      // Install dependencies
      const installProcess = spawn('npm', ['install', '--production'], {
        cwd: devAppPath,
        stdio: 'ignore', // Completely silence npm output to avoid interference
      });

      // Wait for installation to complete
      await new Promise((resolve, reject) => {
        installProcess.on('close', code => {
          if (code === 0) {
            logger.success('Dependencies installed successfully!');
            resolve(undefined);
          } else {
            logger.error('Failed to install dependencies');
            reject(new Error(`npm install failed with code ${code}`));
          }
        });

        installProcess.on('error', error => {
          logger.error('Failed to install dependencies');
          reject(error);
        });
      });
    }

    logger.progress('Starting PayKit development app...');

    // Start the Next.js production server
    const nextProcess = spawn('npm', ['start'], {
      cwd: devAppPath,
      stdio: 'pipe',
    });

    logger.success('PayKit dev server running on http://localhost:3001');
    logger.tip('Press Ctrl+C to stop the server');

    // Handle process termination
    process.on('SIGINT', () => {
      logger.spacer();
      logger.warn('Stopping PayKit dev server...');
      nextProcess.kill();
      process.exit();
    });
  });

program.parse(process.argv);
