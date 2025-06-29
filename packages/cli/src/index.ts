#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('@paykit-sdk/cli')
  .description('PayKit CLI for product setup')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize your product info for PayKit')
  .action(async () => {
    const answers = await inquirer.prompt<{ name: string; price: string }>([
      {
        type: 'input',
        name: 'name',
        message: 'Product name:',
        validate: (input: string) => input ? true : 'Product name is required',
      },
      {
        type: 'input',
        name: 'price',
        message: 'Product price (e.g. $10):',
        validate: (input: string) => input ? true : 'Product price is required',
      },
    ]);

    const priceId = Buffer.from(JSON.stringify(answers)).toString('base64');
    const outPath = path.resolve(process.cwd(), 'paykit.payment.json');
    fs.writeFileSync(outPath, JSON.stringify({ priceId }, null, 2));
    console.log(`\n✅ Product info saved to ${outPath}`);
    console.log('You can now use this file in your hosted page to decode and display product info.');
  });

program.parse(process.argv); 