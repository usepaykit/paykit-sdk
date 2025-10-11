import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import { PaykitMedusaJSAdapter, PaykitMedusaJSAdapterOptions } from './providers/paykit-provider';

export default ModuleProvider(Modules.PAYMENT, {
  services: [PaykitMedusaJSAdapter],
});

export { PaykitMedusaJSAdapter, PaykitMedusaJSAdapterOptions };
