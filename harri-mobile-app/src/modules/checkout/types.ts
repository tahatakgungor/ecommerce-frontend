export type CheckoutFormDraft = {
  name: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  orderNote: string;
  couponCode?: string;
};

export type CheckoutPricingConfig = {
  freeShippingThreshold: number;
  defaultShippingFee: number;
};

export type CheckoutCartItemPayload = {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  orderQuantity: number;
  parent: string;
  category: {
    name: string;
  };
};

export type CheckoutTotals = {
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  remainingForFreeShipping: number;
  isFreeShipping: boolean;
  subtotalText: string;
  shippingText: string;
  discountText: string;
  totalText: string;
};

export type CheckoutInitializePayload = CheckoutFormDraft & {
  firstName: string;
  lastName: string;
  shippingOption: "standard";
  cart: CheckoutCartItemPayload[];
  shippingCost: number;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  agreementAccepted: true;
  agreementAcceptedAt: string;
  mobileReturnUrl: string;
};

export type InitializePaymentResponse = {
  checkoutFormContent: string;
  conversationId: string;
  confirmationToken: string;
  token?: string;
};

export type PendingPaymentSession = {
  checkoutSessionId?: string;
  conversationId: string;
  confirmationToken: string;
  customerEmail: string;
  createdAt: string;
  expiresAt?: string;
  subtotal: number;
  totalAmount: number;
  itemCount: number;
};

export type ConfirmPaymentPayload = {
  token: string;
  conversationId?: string;
  confirmationToken?: string;
};

export type ConfirmPaymentResult = {
  success?: boolean;
  orderId?: string;
  order?: {
    invoice?: string;
    email?: string;
    guestEmail?: string;
    totalAmount?: number;
  };
};

export type PaymentCallback = {
  checkoutSessionId?: string;
  token?: string;
  status?: string;
  error?: string;
  rawUrl: string;
};
