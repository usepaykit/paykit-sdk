import { logger } from '@paykit-sdk/core';
import { Command } from 'commander';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ConfigurationService } from '../services/configuration';
import { PackageManagerService } from '../services/package-manager';
import { RuntimeDetectionService } from '../services/runtime-detection';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const doctorCommand = new Command('doctor').description('Diagnose environment issues and provide solutions').action(async () => {
  try {
    logger.brand();
    logger.info('Running PayKit environment diagnostics...');
    logger.spacer();

    // Check runtime environment
    const runtime = RuntimeDetectionService.detect();
    logger.section('Runtime Environment');

    if (runtime.isCompatible) {
      logger.success(`✓ Runtime: ${runtime.runtime}`);
      if (runtime.nodeVersion) {
        logger.success(`✓ Node.js: ${runtime.nodeVersion}`);
      }
      if (runtime.packageManager) {
        logger.success(`✓ Package Manager: ${runtime.packageManager}`);
      }
    } else {
      logger.error('✗ Environment compatibility issues detected:');
      runtime.compatibilityIssues.forEach(issue => {
        logger.error(`  - ${issue}`);
      });
    }

    // Check package manager
    logger.section('Package Manager');
    const packageManager = new PackageManagerService();
    const pmInfo = packageManager.getInfo();

    if (pmInfo.isAvailable) {
      logger.success(`✓ ${pmInfo.name} ${pmInfo.version} is available`);
      if (pmInfo.lockfilePath) {
        logger.info(`  Lockfile: ${pmInfo.lockfilePath}`);
      }
    } else {
      logger.error(`✗ ${pmInfo.name} is not available`);
      logger.tip(`Install ${pmInfo.name} or use a different package manager`);
    }

    // Check PayKit configuration
    logger.section('PayKit Configuration');
    const configService = new ConfigurationService();

    if (configService.exists()) {
      const config = configService.load();
      if (config) {
        logger.success('✓ PayKit project configured');
        logger.info(`  Project: ${config.project.name}`);
        logger.info(`  Customer: ${config.customer.name}`);
      } else {
        logger.error('✗ Configuration file is corrupted');
      }
    } else {
      logger.warn('⚠ No PayKit project found');
      logger.tip('Run `paykit init` to create a new project');
    }

    // Check dev-app dependencies
    logger.section('Development Dependencies');
    const devAppPath = join(__dirname, '..', '..', '..', 'dev-app');
    const nodeModulesPath = join(devAppPath, 'node_modules');

    if (existsSync(nodeModulesPath)) {
      logger.success('✓ Development dependencies installed');
    } else {
      logger.warn('⚠ Development dependencies not installed');
      logger.tip('Dependencies will be installed automatically when running `npx @paykit-sdk/cli dev`');
    }

    logger.spacer();

    if (runtime.isCompatible && pmInfo.isAvailable) {
      logger.success('Environment is ready for PayKit development!');
      logger.tip('Run `npx @paykit-sdk/cli dev` to start the development server');
    } else {
      logger.error('Environment has issues that need to be resolved');
      logger.tip('Fix the issues above before proceeding');
    }
  } catch (error) {
    logger.error('Failed to run diagnostics');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
});
