import { ChainConfig } from './__config';

export class EtherumChain extends ChainConfig {
  constructor(config: { rpcUrl: string; token: string }) {
    super(config);
  }
}

export const etherum = (config: { rpcUrl: string; token: string }) => {
  return new EtherumChain(config);
};
