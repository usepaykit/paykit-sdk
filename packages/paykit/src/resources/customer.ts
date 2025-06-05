export interface Customer {
  id: string;
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface CreateCustomerParams {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface UpdateCustomerParams {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}
