#!/usr/bin/env node
import { safeEncode, ValidationError, logger } from '@paykit-sdk/core';
import { CheckoutInfo, writePaykitConfig } from '@paykit-sdk/local';
import { spawn } from 'child_process';
import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';

/** CORE CLI */
const program = new Command();

program.name('@paykit-sdk/cli').description('PayKit CLI for product setup').version('1.0.0');

program
  .command('init')
  .description('Initialize your product info for PayKit')
  .action(async () => {
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

    writePaykitConfig({ product, customer, subscriptions: [], checkouts: [], payments: [] });
  });

program.parse(process.argv);

/** DEV CLI */

const command = process.argv[2];

if (command === 'dev') {
  logger.success('Starting PayKit development server...');

  // Path to the dev-app directory
  const devAppPath = path.join(__dirname, '../../dev-app');

  // Start the Next.js dev server
  const nextProcess = spawn('npm', ['run', 'dev'], {
    cwd: devAppPath,
    stdio: 'inherit',
    shell: true,
  });

  logger.info('PayKit dev server running on http://localhost:3001');

  // Handle process termination
  process.on('SIGINT', () => {
    logger.info('Stopping PayKit dev server...');
    nextProcess.kill();
    process.exit();
  });

  nextProcess.on('close', code => {
    logger.info(`PayKit dev server exited with code ${code}`);
    process.exit(code);
  });
} else {
  logger.info('PayKit CLI');
  logger.info('Usage: paykit <command>');
  logger.info('Commands:');
  logger.info('  dev    Start the development server');
}
