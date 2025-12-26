/**
 * Shared Status Configuration
 * Use these consistently across all admin pages for order and product statuses
 */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  processing: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  shipped: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  delivered: "bg-green-500/15 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

// Translation keys for order statuses
export const ORDER_STATUS_KEYS: Record<OrderStatus, string> = {
  pending: "orders.statuses.pending",
  confirmed: "orders.statuses.confirmed",
  processing: "orders.statuses.processing",
  shipped: "orders.statuses.shipped",
  delivered: "orders.statuses.delivered",
  cancelled: "orders.statuses.cancelled",
};

// Active/Inactive status colors
export const ACTIVE_STATUS_COLORS = {
  active: "bg-green-500/15 text-green-400 border-green-500/20",
  inactive: "bg-red-500/15 text-red-400 border-red-500/20",
};

// Role colors
export const ROLE_COLORS = {
  admin: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  customer: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};
