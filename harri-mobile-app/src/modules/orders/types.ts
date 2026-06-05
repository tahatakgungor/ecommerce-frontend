export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "unknown";

export type OrderFilter = "all" | OrderStatus;

export type OrderLineItem = {
  id: string;
  title: string;
  quantity: number;
  price: number;
  priceText: string;
  imageUrl: string | null;
  category: string;
  parentCategory: string;
};

export type OrderSummary = {
  id: string;
  invoice: string;
  status: OrderStatus;
  statusText: string;
  statusDescription: string;
  statusTone: "warning" | "info" | "primary" | "success" | "danger" | "secondary";
  totalAmount: number;
  totalAmountText: string;
  subtotalText: string;
  shippingCostText: string;
  discountText: string;
  paymentMethod: string;
  createdAt: string;
  createdAtText: string;
  itemCount: number;
  isGuest: boolean;
  hasOpenReturn: boolean;
  shippingCarrier: string;
  trackingNumber: string;
};

export type OrderDetail = OrderSummary & {
  name: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  orderNote: string;
  agreementAccepted: boolean;
  agreementAcceptedAt: string;
  shippedAt: string;
  deliveredAt: string;
  guestEmail: string;
  returnStatus: string;
  items: OrderLineItem[];
};

export type OrderOverview = {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
};

export type GuestLookupPayload = {
  invoice: string;
  email: string;
};

export type RawOrderResponse = {
  _id?: string;
  name?: string;
  address?: string;
  contact?: string;
  email?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  shippingOption?: string;
  orderNote?: string;
  status?: string;
  isGuest?: boolean;
  guestEmail?: string;
  invoice?: string;
  subTotal?: number;
  shippingCost?: number;
  discount?: number;
  totalAmount?: number;
  agreementAccepted?: boolean;
  agreementAcceptedAt?: string;
  createdAt?: string;
  cart?: Array<{
    _id?: string;
    id?: string;
    title?: string;
    name?: string;
    price?: number;
    image?: string;
    img?: string;
    quantity?: number;
    orderQuantity?: number;
    parent?: string;
    category?: {
      name?: string;
    };
  }>;
  paymentMethod?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  returnStatus?: string;
  hasOpenReturn?: boolean;
};
