#!/usr/bin/env node
import { logger, tryCatchSync } from '@paykit-sdk/core';
import { Command } from 'commander';
import { devCommand } from './commands/dev';
import { initCommand } from './commands/init';

const program = new Command();

program.name('paykit').description('PayKit CLI for payment development and testing').version('1.1.0');

// Add commands
program.addCommand(initCommand);
program.addCommand(devCommand);

// Global error handler
program.exitOverride();

// Parse arguments
const [, error] = tryCatchSync(() => program.parse(process.argv));

if (error instanceof Error) {
  logger.error(error.message);
  process.exit(1);
}
