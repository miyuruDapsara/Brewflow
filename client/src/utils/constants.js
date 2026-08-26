export const APP_NAME = 'BrewFlow';

export const ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  MANAGER: 'manager',
};

export const STORAGE_KEYS = {
  TOKEN: 'brewflow_token',
  CART: 'brewflow_cart',
};

export const CART_MAX_QUANTITY = 10;
export const CART_NOTES_MAX_LENGTH = 200;

/** Kitchen queue statuses (paid / in progress). */
export const ACTIVE_ORDER_STATUSES = ['PLACED', 'PREPARING', 'READY'];

/**
 * Staff/manager status transitions for the kitchen UI.
 * Payment owns PENDING_PAYMENT → PLACED — staff do not advance unpaid orders.
 */
export const STAFF_STATUS_TRANSITIONS = {
  PLACED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  PENDING_PAYMENT: [],
  PAYMENT_FAILED: [],
};
