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
  Mail,
  Phone,
  User,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
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
  price: string;
  customDesignId?: string;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    icon: <Clock size={20} />,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    icon: <CheckCircle size={20} />,
  },
  processing: {
    label: "Processing",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    icon: <Settings size={20} />,
  },
  shipped: {
    label: "Shipped",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    icon: <Truck size={20} />,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    icon: <Package size={20} />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    icon: <XCircle size={20} />,
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
        <div className="text-center py-12">
          <Package size={64} className="mx-auto mb-4 text-white/20" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Order not found
          </h2>
          <button
            onClick={() => router.push("/orders")}
            className="text-pink-400 hover:text-pink-300"
          >
            Back to Orders
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const currentStatusInfo = statusConfig[order.status];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/orders")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                Order #{order.orderNumber}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${currentStatusInfo.bgColor} ${currentStatusInfo.color}`}
              >
                {currentStatusInfo.icon}
                {currentStatusInfo.label}
              </span>
            </div>
            <p className="text-white/50 text-sm mt-1">
              Created {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                      <Package size={24} className="text-pink-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">
                        {item.productName}
                      </h3>
                      <p className="text-white/50 text-sm">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        ${Number(item.price).toFixed(2)}
                      </div>
                      <div className="text-white/50 text-sm">
                        ${(Number(item.price) * item.quantity).toFixed(2)} total
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-white/40 text-center py-4">
                    No items in this order
                  </p>
                )}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Shipping</span>
                  <span>${Number(order.shipping).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Tax</span>
                  <span>${Number(order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-semibold text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-pink-400">
                    ${Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Order Processing
              </h2>
              <div className="flex items-center justify-between">
                {statusFlow.map((status, index) => {
                  const config = statusConfig[status];
                  const isActive = statusFlow.indexOf(order.status) >= index;
                  const isCurrent = order.status === status;
                  return (
                    <div key={status} className="flex items-center">
                      <div
                        className={`flex flex-col items-center ${
                          isActive ? config.color : "text-white/20"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCurrent
                              ? config.bgColor
                              : isActive
                                ? "bg-white/10"
                                : "bg-white/5"
                          }`}
                        >
                          {config.icon}
                        </div>
                        <span className="text-xs mt-2">{config.label}</span>
                      </div>
                      {index < statusFlow.length - 1 && (
                        <div
                          className={`w-12 h-0.5 mx-2 ${
                            statusFlow.indexOf(order.status) > index
                              ? "bg-pink-500"
                              : "bg-white/10"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Customer
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/70">
                  <User size={18} className="text-white/40" />
                  <span>{order.customerName || "Guest"}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Mail size={18} className="text-white/40" />
                  <span>{order.customerEmail}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Phone size={18} className="text-white/40" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Shipping Address
              </h2>
              <div className="flex items-start gap-3 text-white/70">
                <MapPin size={18} className="text-white/40 mt-0.5" />
                <div>
                  <p>{order.shippingAddress?.street}</p>
                  <p>
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state}{" "}
                    {order.shippingAddress?.postalCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                </div>
              </div>
            </div>

            {/* Update Status */}
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Update Order
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) =>
                        setSelectedStatus(e.target.value as OrderStatus)
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500/50"
                    >
                      {Object.entries(statusConfig).map(([key, { label }]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 resize-none"
                      placeholder="Add internal notes..."
                    />
                  </div>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    <Save size={18} />
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={updating}
                    className="w-full px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 font-medium rounded-lg hover:bg-red-500/20 disabled:opacity-50 transition-all"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
