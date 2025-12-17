"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: string;
  createdAt: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: string;
}

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: <Clock size={14} />,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: <CheckCircle size={14} />,
  },
  processing: {
    label: "Processing",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: <Settings size={14} />,
  },
  shipped: {
    label: "Shipped",
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    icon: <Truck size={14} />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: <Package size={14} />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: <XCircle size={14} />,
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const response = await api.get("/orders", { params });

      if (response.data.data) {
        setOrders(response.data.data);
        setTotalPages(Math.ceil(response.data.total / limit));
      } else {
        setOrders(response.data);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Order Management</h1>
            <p className="text-white/60 text-sm mt-1">
              Manage and track all customer orders
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by order number, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              size={18}
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | "all");
                setPage(1);
              }}
              className="pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-pink-500/50 min-w-[160px]"
            >
              <option value="all">All Status</option>
              {Object.entries(statusConfig).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = orders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status as OrderStatus)}
                className={`p-4 rounded-xl border transition-all ${
                  statusFilter === status
                    ? "bg-white/10 border-pink-500/50"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`p-1.5 rounded-lg ${config.color}`}>
                    {config.icon}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-xs text-white/50">{config.label}</div>
              </button>
            );
          })}
        </div>

        {/* Orders Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-white/60 font-medium text-sm">
                    Order
                  </th>
                  <th className="text-left py-4 px-6 text-white/60 font-medium text-sm">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 text-white/60 font-medium text-sm">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-white/60 font-medium text-sm">
                    Total
                  </th>
                  <th className="text-left py-4 px-6 text-white/60 font-medium text-sm">
                    Date
                  </th>
                  <th className="text-right py-4 px-6 text-white/60 font-medium text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-4 px-6">
                        <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-6 w-20 bg-white/10 rounded animate-pulse" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-5 w-16 bg-white/10 rounded animate-pulse" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-5 w-28 bg-white/10 rounded animate-pulse" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-8 w-8 bg-white/10 rounded animate-pulse ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const statusInfo = statusConfig[order.status];
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        <td className="py-4 px-6">
                          <span className="font-mono text-white font-medium">
                            #{order.orderNumber}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="text-white">
                              {order.customerName || "Guest"}
                            </div>
                            <div className="text-white/50 text-sm">
                              {order.customerEmail}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white font-medium">
                            ${Number(order.total).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white/60 text-sm">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/orders/${order.id}`);
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-white/40">
                      <Package size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No orders found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <span className="text-white/50 text-sm">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
