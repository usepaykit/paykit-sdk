export class PayKitError extends Error {
  constructor(
    message: string,
    public code: string,
    public type: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'PayKitError';
  }
}
