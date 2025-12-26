"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
} from "lucide-react";
import { Spinner } from "@king-neon/ui";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import Pagination from "@/components/Pagination";
import api from "@/utils/api";
import { useApiRequest, withSignal } from "@/hooks/useApiRequest";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n/client";

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

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock size={14} />,
  confirmed: <CheckCircle size={14} />,
  processing: <Settings size={14} />,
  shipped: <Truck size={14} />,
  delivered: <Package size={14} />,
  cancelled: <XCircle size={14} />,
};

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  processing: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  shipped: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  delivered: "bg-green-500/15 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<OrderStatus, number>>(
    {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }
  );
  const limit = 10;

  const { request, abortAll } = useApiRequest();
  const { t } = useTranslation("common");

  const statusLabels: Record<OrderStatus, string> = {
    pending: t("orders.statuses.pending"),
    confirmed: t("orders.statuses.confirmed"),
    processing: t("orders.statuses.processing"),
    shipped: t("orders.statuses.shipped"),
    delivered: t("orders.statuses.delivered"),
    cancelled: t("orders.statuses.cancelled"),
  };

  // Fetch status counts once on mount (independent of filter)
  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        // Fetch all orders without filter to get accurate counts
        const response = await api.get("/orders", { params: { limit: 500 } });
        const allOrders = response.data.data || response.data || [];

        const counts: Record<OrderStatus, number> = {
          pending: 0,
          confirmed: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        };

        allOrders.forEach((order: Order) => {
          if (counts[order.status] !== undefined) {
            counts[order.status]++;
          }
        });

        setStatusCounts(counts);
      } catch (error) {
        console.error("Failed to fetch status counts:", error);
      }
    };

    fetchStatusCounts();
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const response = await request("orders", (signal) =>
        api.get("/orders", withSignal(signal, { params }))
      );

      // Response is null if request was aborted
      if (!response) return;

      if (response.data.data) {
        setOrders(response.data.data);
        setTotalOrders(response.data.total || response.data.data.length);
        setTotalPages(
          response.data.totalPages || Math.ceil(response.data.total / limit)
        );
      } else {
        setOrders(response.data);
        setTotalOrders(response.data.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error(t("orders.error.loadFailed"));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, request]);

  useEffect(() => {
    fetchOrders();
    return () => abortAll();
  }, [fetchOrders, abortAll]);

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

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as OrderStatus | "all");
    setPage(1);
  };

  return (
    <DashboardLayout title={t("orders.title")}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t("orders.management")}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {t("orders.description")}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchOrders}
            className="gap-2 border-zinc-700"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            {t("common.refresh")}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />
            <Input
              type="text"
              placeholder={t("orders.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <Select onValueChange={handleStatusChange} value={statusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("orders.allStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("orders.allStatus")}</SelectItem>
              {(Object.keys(statusLabels) as OrderStatus[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {statusLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(Object.keys(statusLabels) as OrderStatus[]).map((status) => {
            const count = statusCounts[status];
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  statusFilter === status
                    ? "bg-zinc-800 border-pink-500/50"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`p-1.5 rounded-lg border ${statusColors[status]}`}
                  >
                    {statusIcons[status]}
                  </span>
                </div>
                <div className="text-xl font-bold text-white">{count}</div>
                <div className="text-xs text-zinc-500">
                  {statusLabels[status]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Orders Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-zinc-500">
              <Spinner className="w-10 h-10 animate-spin mx-auto mb-4 text-pink-500" />
              {t("orders.loadingOrders")}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center">
              <Package size={48} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">{t("orders.noOrders")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead>{t("orders.table.order")}</TableHead>
                  <TableHead>{t("orders.table.customer")}</TableHead>
                  <TableHead>{t("orders.table.status")}</TableHead>
                  <TableHead>{t("orders.table.total")}</TableHead>
                  <TableHead>{t("orders.table.date")}</TableHead>
                  <TableHead className="text-right">
                    {t("orders.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  return (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      <TableCell>
                        <span className="font-mono text-white font-medium">
                          #{order.orderNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-white font-medium">
                            {order.customerName || t("common.guest")}
                          </div>
                          <div className="text-zinc-500 text-sm">
                            {order.customerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`gap-1.5 border ${statusColors[order.status]}`}
                          variant="outline"
                        >
                          {statusIcons[order.status]}
                          {statusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-white font-semibold">
                          ${Number(order.total).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-zinc-500 text-sm">
                          {formatDate(order.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/orders/${order.id}`);
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalOrders}
            itemsOnPage={orders.length}
            limit={limit}
            onPageChange={setPage}
            itemName="orders"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
