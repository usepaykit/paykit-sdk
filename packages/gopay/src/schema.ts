export interface GoPayTokenResponse {
  /**
   * The type of the token
   */
  token_type: string;

  /**
   * The access token
   */
  access_token: string;

  /**
   * The expiry time of the token
   */
  expires_in: number;
}

export interface GoPayPaymentResponse {
  /**
   * The ID of the payment
   */
  id: number;

  /**
   * The order number of the payment
   */
  order_number: string;

  /**
   * The state of the payment
   */
  state:
    | 'CREATED'
    | 'PAYMENT_METHOD_CHOSEN'
    | 'PAID'
    | 'AUTHORIZED'
    | 'CANCELED'
    | 'TIMEOUTED'
    | 'REFUNDED'
    | 'PARTIALLY_REFUNDED';

  /**
   * The sub state of the payment
   */
  sub_state?: string;

  /**
   * The amount of the payment
   */
  amount: number;

  /**
   * The currency of the payment
   */
  currency: string;

  /**
   * The payment instrument of the payment
   */
  payment_instrument?: string;

  /**
   * The payer of the payment
   */
  payer?: any;

  /**
   * The target of the payment
   */
  target?: any;

  /**
   * The recurrence of the payment
   */
  recurrence?: {
    /**
     * The recurrence cycle of the payment
     */
    recurrence_cycle?: string;

    /**
     * The state of the recurrence e.g (STOPPED)
     */
    recurrence_state?: string;

    /**
     * The recurrence date to of the payment
     */
    recurrence_date_to?: string;

    /**
     * The recurrence date from of the payment
     */
    recurrence_date_from?: string;
  };

  /**
   * The preauthorization of the payment
   */
  preauthorization?: any;

  /**
   * The GW URL of the payment
   */
  gw_url?: string;

  /**
   * The language of the payment
   */
  lang?: string;

  /**
   * The additional parameters of the payment
   */
  additional_params?: Array<{
    /**
     * The name of the additional parameter
     */
    name: string;

    /**
     * The value of the additional parameter
     */
    value: string;
  }>;
}

export interface GoPayPaymentItem {
  /**
   * The type of the item
   */
  type: string;

  /**
   * The name of the item
   */
  name: string;

  /**
   * The amount of the item
   */
  amount: number;

  /**
   * The count of the item
   */
  count: number;

  /**
   * The VAT rate of the item
   */
  vat_rate?: string;

  /**
   * The EAN of the item
   */
  ean?: string;

  /**
   * The product URL of the item
   */
  product_url?: string;
}

export interface GoPayPaymentRequest {
  /**
   * The payer of the payment
   */
  payer: {
    /**
     * The allowed payment instruments of the payer
     */
    allowed_payment_instruments?: string[];

    /**
     * The default payment instrument of the payer
     */
    default_payment_instrument?: string;

    /**
     * The contact of the payer
     */
    contact?: {
      /**
       * The first name of the contact
       */
      first_name?: string;

      /**
       * The last name of the contact
       */
      last_name?: string;

      /**
       * The email of the contact
       */
      email: string;

      /**
       * The phone number of the contact
       */
      phone_number?: string;

      /**
       * The city of the contact
       */
      city?: string;

      /**
       * The street of the contact
       */
      street?: string;

      /**
       * The postal code of the contact
       */
      postal_code?: string;

      /**
       * The country code of the contact
       */
      country_code?: string;
    };
  };

  /**
   * The target of the payment
   */
  target: {
    /**
     * The type of the target
     */
    type: 'ACCOUNT';

    /**
     * The GoID of the target
     */
    goid: number;
  };

  /**
   * The amount of the payment
   */
  amount: number;

  /**
   * The currency of the payment
   */
  currency: string;

  /**
   * The order number of the payment
   */
  order_number: string;

  /**
   * The description of the payment
   */
  order_description?: string;

  /**
   * The items of the payment
   */
  items?: Array<{
    /**
     * The name of the item
     */
    name: string;

    /**
     * The amount of the item
     */
    amount: number;

    /**
     * The count of the item
     */
    count?: number;

    /**
     * The type of the item
     */
    type?: string;

    /**
     * The VAT rate of the item
     */
    vat_rate?: string;

    /**
     * The EAN of the item
     */
    ean?: string;

    /**
     * The product URL of the item
     */
    product_url?: string;
  }>;

  /**
   * The language of the payment
   */
  lang?: string;

  /**
   * The callback of the payment
   */
  callback?: {
    /**
     * The return URL of the payment
     */
    return_url: string;

    /**
     * The notification URL of the payment
     */
    notification_url: string;
  };

  /**
   * The additional parameters of the payment
   */
  additional_params?: Array<{
    /**
     * The name of the additional parameter
     */
    name: string;

    /**
     * The value of the additional parameter
     */
    value: string;
  }>;

  /**
   * The recurrence of the payment
   */
  recurrence?: {
    /**
     * The recurrence cycle of the payment
     */
    recurrence_cycle: 'DAY' | 'WEEK' | 'MONTH' | 'ON_DEMAND';

    /**
     * The recurrence period of the payment
     */
    recurrence_period?: number;

    /**
     * The recurrence date to of the payment
     */
    recurrence_date_to?: string;
  };

  /**
   * The preauthorization of the payment
   */
  preauthorization?: boolean;
}
