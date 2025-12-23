"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  MapPin,
  User,
  Save,
  Calendar,
  ShoppingBag,
  Check,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  customDesignId?: string;
  options?: Record<string, unknown>;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    icon: <Clock size={18} />,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    icon: <CheckCircle size={18} />,
  },
  processing: {
    label: "Processing",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    icon: <Settings size={18} />,
  },
  shipped: {
    label: "Shipped",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    icon: <Truck size={18} />,
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    icon: <Package size={18} />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    icon: <XCircle size={18} />,
  },
};

const statusFlow: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
        setSelectedStatus(response.data.status);
        setNotes(response.data.notes || "");
      } catch (error) {
        console.error("Failed to fetch order:", error);
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${orderId}`, {
        status: selectedStatus,
        notes,
      });
      setOrder({ ...order, status: selectedStatus, notes });
      toast.success("Order updated successfully!");
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setUpdating(true);
    try {
      await api.post(`/orders/${orderId}/cancel`);
      setOrder({ ...order!, status: "cancelled" });
      setSelectedStatus("cancelled");
      toast.success("Order cancelled");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <Package size={64} className="mx-auto mb-6 text-white/20" />
          <h2 className="text-2xl font-semibold text-white mb-3">
            Order not found
          </h2>
          <button
            onClick={() => router.push("/orders")}
            className="text-pink-400 hover:text-pink-300 text-lg"
          >
            ← Back to Orders
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const currentStatusInfo = statusConfig[order.status];
  const currentStatusIndex = statusFlow.indexOf(order.status);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pt-4">
          <div className="space-y-4">
            <button
              onClick={() => router.push("/orders")}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Orders</span>
            </button>

            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                #{order.orderNumber}
              </h1>
              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${currentStatusInfo.bgColor} border-white/5 ${currentStatusInfo.color}`}
              >
                {currentStatusInfo.icon}
                {currentStatusInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Calendar size={16} />
              <span>Ordered on {formatDate(order.createdAt)}</span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end p-5 bg-[#1a1a1a] border border-white/10 rounded-2xl md:bg-transparent md:border-none md:p-0">
            <p className="text-white/50 text-sm mb-1 font-medium">
              Total Amount
            </p>
            <p className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              ${(Number(order.total) || 0).toFixed(2)}
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm">
              {order.status === "delivered" ? (
                <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                  <CheckCircle size={12} /> Paid
                </span>
              ) : order.status === "cancelled" ? (
                <span className="text-red-400 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded">
                  <XCircle size={12} /> Refunded
                </span>
              ) : (
                <span className="text-white/40 flex items-center gap-1">
                  <CreditCard size={12} /> Payment Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Order Progress Timeline */}
        {order.status !== "cancelled" && (
          <div className="bg-[#1a1a1a] rounded-2xl p-8 mb-10 border border-white/10 shadow-xl shadow-black/20 overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="flex justify-between mb-2">
                {statusFlow.map((status, index) => {
                  const config = statusConfig[status];
                  const isCompleted = currentStatusIndex > index;
                  const isCurrent = currentStatusIndex === index;
                  return (
                    <div
                      key={status}
                      className={`text-sm font-medium transition-colors duration-300 w-32 text-center
                        ${isCompleted || isCurrent ? "text-white" : "text-white/30"}
                      `}
                    >
                      {config.label}
                    </div>
                  );
                })}
              </div>

              <div className="relative py-4">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-white/5 rounded-full -translate-y-1/2" />

                {/* Active Progress Line */}
                <div
                  className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full -translate-y-1/2 transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(0, (currentStatusIndex / (statusFlow.length - 1)) * 100)}%`,
                  }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                  {statusFlow.map((status, index) => {
                    const config = statusConfig[status];
                    const isCompleted = currentStatusIndex > index;
                    const isCurrent = currentStatusIndex === index;

                    return (
                      <div key={status} className="flex justify-center w-32">
                        <div
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center z-10
                            border-4 transition-all duration-300 transform
                            ${
                              isCompleted
                                ? "bg-purple-500 border-[#1a1a1a] scale-100"
                                : isCurrent
                                  ? `${config.bgColor} ${config.color} border-[#1a1a1a] ring-2 ring-purple-500 ring-offset-2 ring-offset-[#1a1a1a] scale-110`
                                  : "bg-[#2a2a2a] border-[#1a1a1a] text-white/20"
                            }
                          `}
                        >
                          {isCompleted ? (
                            <Check size={16} className="text-white" />
                          ) : (
                            config.icon
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancelled Alert */}
        {order.status === "cancelled" && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-10 flex items-start gap-5">
            <XCircle className="text-red-400 mt-1" size={24} />
            <div>
              <h3 className="text-red-400 font-semibold text-lg mb-1">
                Order Cancelled
              </h3>
              <p className="text-red-400/70 leading-relaxed">
                This order was cancelled on {formatDate(order.updatedAt)}. No
                further actions can be taken.
              </p>
            </div>
          </div>
        )}

        {/* Main Content Grid - Responsive layout switching from stack to grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Column: Order Items */}
          <div className="flex-1 space-y-8">
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/20">
              <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <ShoppingBag size={20} className="text-white/70" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Order Items
                  </h2>
                </div>
                <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-white/50">
                  {order.items?.length || 0} items
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {order.items?.map((item) => {
                  const unitPrice = Number(item.unitPrice) || 0;
                  const total = unitPrice * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="p-8 hover:bg-white/[0.01] transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Product Image Placeholder */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5">
                          <Package size={32} className="text-white/20" />
                        </div>

                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-xl font-semibold text-white mb-2 truncate pr-4">
                                {item.productName || "Custom Neon Design"}
                              </h3>
                              {item.customDesignId && (
                                <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-3">
                                  Custom Design
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-white">
                                ${total.toFixed(2)}
                              </p>
                              <p className="text-sm text-white/40 mt-1">
                                ${unitPrice.toFixed(2)} / each
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-white/60 pt-2 border-t border-white/5 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                              <span>
                                Quantity:{" "}
                                <span className="text-white font-medium">
                                  {item.quantity}
                                </span>
                              </span>
                            </div>
                            {item.options &&
                              Object.keys(item.options).length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                                  <span>
                                    Options:{" "}
                                    <span className="text-white font-medium">
                                      {Object.keys(item.options).length}
                                    </span>
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Totals Summary */}
              <div className="bg-white/[0.02] p-8 border-t border-white/10">
                <div className="flex flex-col gap-3 ml-auto max-w-sm">
                  <div className="flex justify-between text-base">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white font-medium">
                      ${(Number(order.subtotal) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-white/60">Shipping</span>
                    <span
                      className={`font-medium ${Number(order.shipping) === 0 ? "text-emerald-400" : "text-white"}`}
                    >
                      {Number(order.shipping) === 0
                        ? "Free"
                        : `$${(Number(order.shipping) || 0).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-white/60">Tax</span>
                    <span className="text-white font-medium">
                      ${(Number(order.tax) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold text-lg">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-white">
                      ${(Number(order.total) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Details & Actions */}
          <div className="lg:w-[400px] flex-shrink-0 flex flex-col gap-6">
            {/* Customer Details */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/20">
              <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
                <User size={18} className="text-blue-400" />
                <h3 className="font-semibold text-white">Customer Details</h3>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg">
                    {(order.customerName || "G").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-lg truncate mb-1">
                      {order.customerName || "Guest"}
                    </p>
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="text-blue-400 hover:text-blue-300 text-sm truncate block transition-colors"
                    >
                      {order.customerEmail}
                    </a>
                  </div>
                </div>

                {order.customerPhone && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-white/40 uppercase font-semibold tracking-wider mb-1">
                      Contact Phone
                    </p>
                    <p className="text-white">{order.customerPhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/20">
              <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
                <MapPin size={18} className="text-emerald-400" />
                <h3 className="font-semibold text-white">Shipping Address</h3>
              </div>
              <div className="p-6">
                <div className="space-y-1">
                  <p className="text-white font-medium text-lg leading-snug">
                    {order.shippingAddress?.street}
                  </p>
                  <p className="text-white/70">
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state}{" "}
                    {order.shippingAddress?.postalCode}
                  </p>
                  <p className="text-white/70">
                    {order.shippingAddress?.country}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
                  <Truck size={16} className="text-white/40" />
                  <span className="text-white/60 text-sm">
                    Standard Shipping
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/20">
                <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
                  <Settings size={18} className="text-purple-400" />
                  <h3 className="font-semibold text-white">Manage Order</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                      Update Status
                    </label>
                    <div className="relative">
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(e.target.value as OrderStatus)
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all cursor-pointer hover:bg-white/10"
                      >
                        {Object.entries(statusConfig).map(
                          ([key, { label }]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                        <ArrowLeft size={16} className="-rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                      Internal Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all resize-none"
                      placeholder="Add private notes specific to this order..."
                    />
                  </div>

                  <div className="pt-2 flex flex-col gap-3">
                    <button
                      onClick={handleUpdateStatus}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      <Save size={18} />
                      {updating ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      onClick={handleCancelOrder}
                      disabled={updating}
                      className="w-full px-4 py-3.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium rounded-xl transition-all"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
