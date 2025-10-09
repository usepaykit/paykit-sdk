import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import { PaykitMedusaAdapter, PaykitMedusaAdapterOptions } from './providers/paykit-provider';

export default ModuleProvider(Modules.PAYMENT, {
  services: [PaykitMedusaAdapter],
});

export { PaykitMedusaAdapter, PaykitMedusaAdapterOptions };
