"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "../checkout.module.scss";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    // In production, fetch order details from API
    if (orderId) {
      setOrderNumber(orderId);
    }
  }, [orderId]);

  return (
    <div className={styles.successPage}>
      <div className={styles.successPage__icon}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className={styles.successPage__title}>Thank You for Your Order!</h1>

      <p className={styles.successPage__message}>
        Your payment was successful. We&apos;ve sent a confirmation email with
        your order details.
      </p>

      {orderNumber && (
        <div className={styles.successPage__orderNumber}>
          <span>Order Number:</span>
          <strong>{orderNumber}</strong>
        </div>
      )}

      <div className={styles.successPage__info}>
        <div className={styles.successPage__infoItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <div>
            <strong>Email Confirmation</strong>
            <p>Check your inbox for order confirmation</p>
          </div>
        </div>

        <div className={styles.successPage__infoItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <strong>Processing Time</strong>
            <p>Your custom neon sign will be ready in 5-7 business days</p>
          </div>
        </div>

        <div className={styles.successPage__infoItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <strong>Questions?</strong>
            <p>Contact us at support@kingneon.com</p>
          </div>
        </div>
      </div>

      <div className={styles.successPage__actions}>
        <Link href="/account/orders" className={styles.successPage__btn}>
          View My Orders
        </Link>
        <Link
          href="/"
          className={`${styles.successPage__btn} ${styles.successPage__btnSecondary}`}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className={styles.checkout}>
      <div className={styles.checkout__container}>
        <Suspense fallback={<div>Loading order details...</div>}>
          <CheckoutSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
