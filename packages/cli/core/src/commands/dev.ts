import { logger } from '@paykit-sdk/core';
import { Command } from 'commander';
import { DevServerService } from '../services/dev-server';
import { RuntimeDetectionService } from '../services/runtime-detection';

export const devCommand = new Command('dev')
  .description('Start the PayKit development server')
  .option('-p, --port <port>', 'Port to run the server on', '3001')
  .option('-h, --host <host>', 'Host to bind the server to', 'localhost')
  .action(async options => {
    try {
      // Detect runtime environment
      const runtime = RuntimeDetectionService.detect();

      if (!runtime.isCompatible) {
        logger.error('Environment compatibility issues detected:');
        runtime.compatibilityIssues.forEach(issue => {
          logger.error(`  - ${issue}`);
        });
        process.exit(1);
      }

      logger.brand();
      logger.info('Starting PayKit development server...');
      logger.spacer();

      // Start development server
      const devServer = new DevServerService();
      const status = await devServer.start({
        port: parseInt(options.port),
        host: options.host,
      });

      logger.success(`Development server running at ${status.url}`);
      logger.tip('Press Ctrl+C to stop the server');

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
