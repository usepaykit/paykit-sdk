import { logger } from '@paykit-sdk/core';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { configSchema } from '../schema';
import { ConfigurationService } from '../services/configuration';
import { DEFAULT_PORT } from '../services/dev-server';
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
    logger.welcome('Welcome to PayKit Setup!');
    logger.spacer();

    // Get project information
    const nameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Product name:',
        validate: (input: string) => (input ? true : 'Product name is required'),
      },
    ]);
    logger.setupStep('Product name:', nameAnswer.name);

    const descriptionAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Product description (optional):',
      },
    ]);
    logger.setupStep('Product description (optional):', descriptionAnswer.description || 'None');

    const priceAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'price',
        message: 'Product price:',
        default: '20',
        validate: (input: string) => {
          if (!input) return 'Product price is required';
          const num = parseFloat(input);
          if (isNaN(num) || num <= 0) return 'Please enter a valid positive number';
          return true;
        },
      },
    ]);
    logger.setupStep('Product price:', priceAnswer.price);

    const currencyAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'currency',
        message: 'Product currency:',
        default: 'USD',
      },
    ]);

    logger.setupStep('Product currency:', currencyAnswer.currency);

    const customerNameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'customerName',
        message: 'Default customer name:',
        validate: (input: string) => (input ? true : 'Customer name is required'),
      },
    ]);
    logger.setupStep('Default customer name:', customerNameAnswer.customerName);

    const customerEmailAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'customerEmail',
        message: 'Default customer email:',
        default: 'johndoe@gmail.com',
        validate: (input: string) => {
          if (!input) return 'Customer email is required';
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(input) ? true : 'Please enter a valid email address';
        },
      },
    ]);

    logger.setupStep('Default customer email:', customerEmailAnswer.customerEmail);

    // Combine all answers
    const answers = {
      name: nameAnswer.name,
      description: descriptionAnswer.description,
      price: priceAnswer.price,
      currency: currencyAnswer.currency,
      customerName: customerNameAnswer.customerName,
      customerEmail: customerEmailAnswer.customerEmail,
    };

    logger.progressIndicator('Setting up your billing project...');

    const configService = new ConfigurationService();
    const config = configService.createDefault(
      answers.name,
      answers.description,
      answers.price,
      answers.currency,
      answers.customerName,
      answers.customerEmail,
      DEFAULT_PORT,
    );

    // Validate configuration with Zod
    try {
      configSchema.parse(config);
    } catch (error: any) {
      logger.error('Configuration validation failed:');
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join('.');
          logger.error(`  - ${path}: ${err.message}`);
        });
      } else {
        logger.error(`  - ${error.message}`);
      }
      process.exit(1);
    }

    const success = configService.save(config);
    if (!success) {
      logger.error('Failed to save configuration');
      process.exit(1);
    }

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
