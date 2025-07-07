import { etherum } from './chains';
import { CryptoConfig, CryptoProvider } from './crypto-provider';

export const createCrypto = (config: CryptoConfig) => {
  return new CryptoProvider(config);
};

export const crypto = () => {
  return createCrypto({
    debug: true,
    chain: etherum({
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
      token: 'ETH',
    }),
    merchantXpub: 'YOUR_MERCHANT_XPUB',
  });
};
