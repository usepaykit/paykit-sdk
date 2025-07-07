export class ChainConfig {
  constructor(private readonly config: { rpcUrl: string; token: string }) {}

  getRpcUrl() {
    return this.config.rpcUrl;
  }
}
