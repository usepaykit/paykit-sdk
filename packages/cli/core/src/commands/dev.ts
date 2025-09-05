import { logger } from '@paykit-sdk/core';
import { Command } from 'commander';
import { DevServerService, DEFAULT_HOST, DEFAULT_PORT } from '../services/dev-server';

export const devCommand = new Command('dev')
  .description('Start the PayKit development server')
  .option('-p, --port <port>', 'Port to run the server on', DEFAULT_PORT.toString())
  .option('-h, --host <host>', 'Host to bind the server to', DEFAULT_HOST)
  .action(async () => {
    try {
      logger.brand();
      logger.info('Starting paykit development server...');
      logger.spacer();

      // Start development server
      const devServer = new DevServerService();

      const status = await devServer.start();

      logger.success(`Development server running at ${status.url}`);
      logger.tip('Press ctrl+c to stop the server');

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        logger.spacer();
        logger.warn('Stopping development server...');
        devServer.stop();
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        devServer.stop();
        process.exit(0);
      });
    } catch (error) {
      logger.error('Failed to start development server');
      if (error instanceof Error) {
        logger.error(error.message);
      }
      process.exit(1);
    }
  });
