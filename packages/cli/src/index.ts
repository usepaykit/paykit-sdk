#!/usr/bin/env node
import { safeEncode, ValidationError, logger } from '@paykit-sdk/core';
import { CheckoutInfo } from '@paykit-sdk/local';
import { Command } from 'commander';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

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
    const outPath = path.resolve(process.cwd(), 'paykit.config.json');
    const customerId = safeEncode<string>(answers.customerEmail);

    logger.clearProgress();

    if (!customerId.ok) throw new ValidationError('Invalid customer email', customerId.error);

    if (!itemId.ok) throw new ValidationError('Invalid product info', itemId.error);

    const product = { name: answers.name, description: answers.description, price: answers.price, priceId: itemId.value };
    const customer = { id: customerId.value, name: answers.customerName, email: answers.customerEmail };

    const data = { product, customer };

    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

    logger.success(`Product info saved to ${outPath}`);
    logger.tip('You can now use this file in your hosted page to decode and display product info.');
  });

program.parse(process.argv);
