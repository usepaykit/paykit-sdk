import { createTsupConfig } from '../../tsup.config.base';
import { paypalImportTransformer } from './tsup-plugin-paypal-imports';

export default createTsupConfig({
  external: ['@paypal/paypal-server-sdk'],
  esbuildPlugins: [paypalImportTransformer()],
});
