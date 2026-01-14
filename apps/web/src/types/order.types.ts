export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantSize?: string;
  variantColor?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderUser {
  id: string;
  name: string;
  email: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: OrderUser;
  guestEmail?: string;
  guestPhone?: string;

  items: OrderItem[];
  shippingAddress: ShippingAddress;

  subtotal: number;
  shippingFee: number;
  discount: number;
  tax?: number;
  total: number;

  status: string;
  paymentStatus: string;
  paymentMethod: string;

  notes?: string;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDeliveryDate?: string;

  createdAt: string;
  updatedAt: string;
}
