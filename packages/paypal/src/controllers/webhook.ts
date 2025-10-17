import { ApiResponse, CustomError } from '@paypal/paypal-server-sdk';
import { BaseController } from '@paypal/paypal-server-sdk/dist/types/controllers/baseController';
import { VerifyWebhookSchema, verifyWebhookSchema } from '../schema';

export class WebhookController extends BaseController {
  async verifyWebhook(body: {
    authAlgo: string;
    certUrl: string;
    transmissionId: string;
    transmissionSig: string;
    transmissionTime: string;
    webhookId: string;
    webhookEvent: string;
  }): Promise<ApiResponse<VerifyWebhookSchema>> {
    const req = this.createRequest('POST', '/v1/notifications/verify-webhook-signature');
    req.header('Content-Type', 'application/json');

    req.throwOn(
      400,
      CustomError,
      'Request is not well-formed, syntactically incorrect, or violates schema.',
    );
    req.throwOn(
      401,
      CustomError,
      'Authentication failed due to missing authorization header, or invalid authentication credentials.',
    );
    req.throwOn(
      422,
      CustomError,
      'The requested action could not be performed, semantically incorrect, or failed business validation.',
    );
    req.json(
      Object.fromEntries(
        Object.entries(body).map(([key, value]) => [
          key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
          value,
        ]),
      ),
    );

    req.authenticate([{ oauth2: true }]);
    return req.callAsJson(verifyWebhookSchema);
  }
}
