import { Module, Modules } from '@medusajs/framework/utils';
import {
  PaykitMedusaJSAdapter,
  PaykitMedusaJSAdapterOptions,
} from './providers/paykit-provider';

export default Module(Modules.PAYMENT, {
  service: PaykitMedusaJSAdapter,
});

export { PaykitMedusaJSAdapter, PaykitMedusaJSAdapterOptions };
