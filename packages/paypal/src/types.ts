export type SubscriptionStatus =
  | 'APPROVAL_PENDING'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface PayPalSubscription {
  /**
   * The ID of the subscription.
   */
  id: string;

  /**
   * The ID of the plan.
   */
  plan_id: string;

  /**
   * The status of the subscription.
   */
  status: SubscriptionStatus;

  /**
   * The time the status was updated.
   */
  status_update_time?: string;

  /**
   * The time the subscription started.
   */
  start_time?: string;

  /**
   * The time the subscription was created.
   */
  create_time?: string;

  /**
   * The subscriber of the subscription.
   */
  subscriber?: {
    /**
     * The email of the subscriber.
     */
    email_address?: string;

    /**
     * The name of the subscriber.
     */
    name?: {
      /**
       * The given name of the subscriber.
       */
      given_name?: string;
      /**
       * The surname of the subscriber.
       */
      surname?: string;
    };
  };

  /**
   * The billing info of the subscription.
   */
  billing_info?: {
    /**
     * The outstanding balance of the subscription.
     */
    outstanding_balance?: {
      /**
       * The currency code of the outstanding balance.
       */
      currency_code?: string;
      /**
       * The value of the outstanding balance.
       */
      value?: string;
    };
    cycle_executions?: Array<{
      /**
       * The tenure type of the cycle execution.
       */
      tenure_type?: string;

      /**
       * The sequence of the cycle execution.
       */
      sequence?: number;

      /**
       * The number of cycles completed.
       */
      cycles_completed?: number;

      /**
       * The total number of cycles.
       */
      total_cycles?: number;
    }>;
  };

  /**
   * The links of the subscription.
   */
  links?: Array<{
    /**
     * The href of the link.
     */
    href?: string;
    /**
     * The rel of the link.
     */
    rel?: string;
    /**
     * The method of the link.
     */
    method?: string;
  }>;

  /**
   * The custom ID of the subscription, i.e metadata
   */
  customId?: string;
}
