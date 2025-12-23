"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import styles from "./order-detail.module.scss";
import api from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

interface OrderItem {
  id: string;
  productId?: string;
  customDesignId?: string;
  quantity: number;
  unitPrice: number;
  productName?: string;
  options?: Record<string, unknown>;
  product?: {
    id: string;
    name: string;
    images?: string[];
  };
  customDesign?: {
    id: string;
    text?: string;
    previewImage?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  notes?: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to complete loading
    if (authLoading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError("Order not found or you don't have permission to view it.");
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router, authLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className={styles.orderDetail}>
        <div className={styles.orderDetail__container}>
          <div className={styles.orderDetail__loading}>
            Loading order details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.orderDetail}>
        <div className={styles.orderDetail__container}>
          <div className={styles.orderDetail__error}>
            <h2>Error</h2>
            <p>{error || "Order not found"}</p>
            <Link href="/account" className={styles.orderDetail__backLink}>
              ← Back to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.orderDetail}>
      <div className={styles.orderDetail__container}>
        {/* Header */}
        <div className={styles.orderDetail__header}>
          <Link href="/account" className={styles.orderDetail__backLink}>
            ← Back to Orders
          </Link>
          <div className={styles.orderDetail__titleRow}>
            <h1 className={styles.orderDetail__title}>
              Order {order.orderNumber}
            </h1>
            <span
              className={`${styles.orderDetail__status} ${styles[`orderDetail__status--${order.status}`]}`}
            >
              {statusLabels[order.status] || order.status}
            </span>
          </div>
          <p className={styles.orderDetail__date}>
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className={styles.orderDetail__grid}>
          {/* Order Items */}
          <section className={styles.orderDetail__section}>
            <h2 className={styles.orderDetail__sectionTitle}>Order Items</h2>
            <div className={styles.orderDetail__items}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.orderDetail__item}>
                  <div className={styles.orderDetail__itemImage}>
                    {item.product?.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.images[0]}
                        alt={item.productName || "Product"}
                      />
                    ) : item.customDesign?.previewImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.customDesign.previewImage}
                        alt="Custom Design"
                      />
                    ) : (
                      <span className={styles.orderDetail__itemPlaceholder}>
                        KN
                      </span>
                    )}
                  </div>
                  <div className={styles.orderDetail__itemDetails}>
                    <div className={styles.orderDetail__itemName}>
                      {item.productName ||
                        item.product?.name ||
                        item.customDesign?.text ||
                        "Custom Neon Sign"}
                    </div>
                    <div className={styles.orderDetail__itemMeta}>
                      Qty: {item.quantity} × $
                      {Number(item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                  <div className={styles.orderDetail__itemTotal}>
                    ${(item.quantity * Number(item.unitPrice)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Order Summary */}
          <section className={styles.orderDetail__section}>
            <h2 className={styles.orderDetail__sectionTitle}>Order Summary</h2>
            <div className={styles.orderDetail__summary}>
              <div className={styles.orderDetail__summaryRow}>
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className={styles.orderDetail__summaryRow}>
                <span>Shipping</span>
                <span>${Number(order.shipping).toFixed(2)}</span>
              </div>
              {Number(order.tax) > 0 && (
                <div className={styles.orderDetail__summaryRow}>
                  <span>Tax</span>
                  <span>${Number(order.tax).toFixed(2)}</span>
                </div>
              )}
              <div
                className={`${styles.orderDetail__summaryRow} ${styles.orderDetail__summaryTotal}`}
              >
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.orderDetail__payment}>
              <span>Payment Status:</span>
              <span
                className={`${styles.orderDetail__paymentBadge} ${styles[`orderDetail__paymentBadge--${order.paymentStatus}`]}`}
              >
                {paymentStatusLabels[order.paymentStatus] ||
                  order.paymentStatus}
              </span>
            </div>
          </section>

          {/* Shipping Address */}
          <section className={styles.orderDetail__section}>
            <h2 className={styles.orderDetail__sectionTitle}>
              Shipping Address
            </h2>
            <address className={styles.orderDetail__address}>
              {order.customerName && <div>{order.customerName}</div>}
              <div>{order.shippingAddress.street}</div>
              <div>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </div>
              <div>{order.shippingAddress.country}</div>
              {order.customerPhone && (
                <div className={styles.orderDetail__phone}>
                  {order.customerPhone}
                </div>
              )}
              {order.customerEmail && (
                <div className={styles.orderDetail__email}>
                  {order.customerEmail}
                </div>
              )}
            </address>
          </section>

          {/* Notes */}
          {order.notes && (
            <section className={styles.orderDetail__section}>
              <h2 className={styles.orderDetail__sectionTitle}>Order Notes</h2>
              <p className={styles.orderDetail__notes}>{order.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
