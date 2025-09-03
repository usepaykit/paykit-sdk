import { logger } from '@paykit-sdk/core';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { ConfigurationService } from '../services/configuration';
import { RuntimeDetectionService } from '../services/runtime-detection';

export const initCommand = new Command('init').description('Initialize a new PayKit project').action(async () => {
  try {
    const runtime = RuntimeDetectionService.detect();

    if (!runtime.isCompatible) {
      logger.error('Environment compatibility issues detected:');
      runtime.compatibilityIssues.forEach(issue => {
        logger.error(`  - ${issue}`);
      });
      process.exit(1);
    }

    logger.brand();
    logger.info("Welcome to PayKit! Let's set up your project.");
    logger.spacer();

    // Get project information
    const answers = await inquirer.prompt([
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
          if (!input) return true;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(input) ? true : 'Please enter a valid email address';
        },
      },
    ]);

    logger.progress('Creating PayKit configuration...');

    const configService = new ConfigurationService();
    const config = configService.createDefault(answers.name, answers.customerName, answers.price, answers.description, answers.customerEmail);

    const validation = configService.validate(config);

    if (!validation.isValid) {
      logger.error('Configuration validation failed:');
      validation.errors.forEach(error => {
        logger.error(`  - ${error}`);
      });
      process.exit(1);
    }

    const success = configService.save(config);
    if (!success) {
      logger.error('Failed to save configuration');
      process.exit(1);
    }

    logger.clearProgress();
    logger.spacer();
    logger.success('PayKit project initialized successfully!');
    logger.tip('Run `npx @paykit-sdk/cli dev` to start the development server');
  } catch (error) {
    logger.error('Failed to initialize PayKit project');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
});
