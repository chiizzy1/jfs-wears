import { Order } from "./order.types";

export interface TrackOrderRequest {
  orderNumber: string;
}

export interface OrderStatusHistory {
  status: string;
  timestamp: string;
  comment?: string;
}

export interface TrackOrderResponse extends Order {
  statusHistory?: OrderStatusHistory[];
}
