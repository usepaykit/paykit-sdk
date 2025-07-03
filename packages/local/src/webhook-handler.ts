import { logger, WebhookEventPayload } from '@paykit-sdk/core';

export const $customerCreatedWebhookHandler = (payload: WebhookEventPayload) => {
  logger.info('Customer created');
};

export const $customerUpdatedWebhookHandler = (payload: WebhookEventPayload) => {
  logger.info('Customer updated');
};

export const $customerDeletedWebhookHandler = (payload: WebhookEventPayload) => {
  logger.info('Customer deleted');
};

export const $subscriptionCreatedWebhookHandler = (payload: WebhookEventPayload) => {
  logger.info('Subscription created');
};

export const $subscriptionUpdatedWebhookHandler = (payload: WebhookEventPayload) => {
  logger.info('Subscription updated');
};

export const $subscriptionCanceledWebhookHandler = (payload: WebhookEventPayload) => {};

export const $checkoutCreatedWebhookHandler = (payload: WebhookEventPayload) => {
  logger.info('Checkout created');
};

export const $paymentReceivedWebhookHandler = (payload: WebhookEventPayload) => {
  logger.info('Payment received');
};
