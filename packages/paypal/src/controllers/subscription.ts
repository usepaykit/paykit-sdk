import { CreateSubscriptionSchema } from '@paykit-sdk/core';
import { ApiResponse, CustomError } from '@paypal/paypal-server-sdk';
import { BaseController } from '@paypal/paypal-server-sdk/dist/types/controllers/baseController';
import {
  createSubscriptionApticSchema,
  resumeSubscriptionApticSchemaRequest,
  resumeSubscriptionApticSchemaRequest as cancelSubscriptionApticSchemaRequest,
  subscriptionApticSchema,
} from '../schema';

export class SubscriptionsController extends BaseController {
  private catchAllErrors(req: ReturnType<BaseController['createRequest']>) {
    req.throwOn(400, CustomError, 'Request is not well-formed, syntactically incorrect, or violates schema.');
    req.throwOn(401, CustomError, 'Authentication failed due to missing authorization header, or invalid authentication credentials.');
    req.throwOn(422, CustomError, 'The requested action could not be performed, semantically incorrect, or failed business validation.');
  }

  /**
   * @return Response from the API call
   */
  async createSubscription({ body }: { body: CreateSubscriptionSchema }): Promise<ApiResponse<any>> {
    const req = this.createRequest('POST', '/v1/billing/subscriptions');
    const mapped = req.prepareArgs({ body: [body, createSubscriptionApticSchema] });
    req.header('Content-Type', 'application/json');
    req.header('PayPal-Request-Id', Math.random().toString(36).substring(2, 15));

    req.json(mapped.body);
    this.catchAllErrors(req);
    req.authenticate([{ oauth2: true }]);
    return req.callAsJson(subscriptionApticSchema);
  }

  /**
   * @returns Response from the API call
   */
  async resumeSubscription({ body, subscriptionId }: { body: { reason: string }; subscriptionId: string }) {
    const req = this.createRequest('POST', `v1/billing/subscriptions/${subscriptionId}/activate `);
    const mapped = req.prepareArgs({ body: [body, resumeSubscriptionApticSchemaRequest] });
    req.header('Content-Type', 'application/json');
    req.header('PayPal-Request-Id', Math.random().toString(36).substring(2, 15));

    req.json(mapped.body);
    this.catchAllErrors(req);
    req.authenticate([{ oauth2: true }]);
  }

  async retrieveSubscription({ subscriptionId }: { subscriptionId: string }) {
    const req = this.createRequest('GET', `v1/billing/subscriptions/${subscriptionId}`);
    req.header('PayPal-Request-Id', Math.random().toString(36).substring(2, 15));
    this.catchAllErrors(req);
    req.authenticate([{ oauth2: true }]);
    return req.callAsJson(subscriptionApticSchema);
  }

  async cancelSubscription({ subscriptionId, reason }: { subscriptionId: string; reason: string }) {
    const req = this.createRequest('POST', `v1/billing/subscriptions/${subscriptionId}/cancel`);
    const mapped = req.prepareArgs({ body: [reason, cancelSubscriptionApticSchemaRequest] });
    req.header('PayPal-Request-Id', Math.random().toString(36).substring(2, 15));
    req.json(mapped.body);
    this.catchAllErrors(req);
    req.authenticate([{ oauth2: true }]);
    return req.callAsJson(subscriptionApticSchema);
  }

  async updateSubscription({ subscriptionId, metadata }: { subscriptionId: string; metadata: Record<string, unknown> }) {
    const req = this.createRequest('PATCH', `v1/billing/subscriptions/${subscriptionId}`);
    req.header('PayPal-Request-Id', Math.random().toString(36).substring(2, 15));

    req.json({ op: 'replace', path: '/custom_id', value: JSON.stringify(metadata) });

    this.catchAllErrors(req);
    req.authenticate([{ oauth2: true }]);
  }
}
