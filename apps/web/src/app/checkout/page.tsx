"use client";

import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { selectCartItems, selectCartTotal, clearAllCart } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { StripeProvider } from "@/components/StripeProvider";
import { PaymentForm } from "@/components/PaymentForm";
import styles from "./checkout.module.scss";

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const shipping = subtotal > 200 ? 0 : 15;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
  }, [authLoading, isAuthenticated, router]);

  const [formData, setFormData] = useState<ShippingForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  // Pre-fill form with user data when authenticated
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(" ") || [];
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || prev.firstName,
        lastName: nameParts.slice(1).join(" ") || prev.lastName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createOrderAndPaymentIntent = async () => {
    setIsCreatingOrder(true);
    setError(null);

    try {
      // Step 1: Create order
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.zipCode,
            country: formData.country,
          },
          shipping,
          tax,
          items: items.map((item) => ({
            productName: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const order = await orderResponse.json();
      setOrderId(order.id);

      // Step 2: Create payment intent
      const paymentResponse = await fetch(
        `${API_URL}/payments/create-payment-intent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            orderId: order.id,
            customerEmail: formData.email,
          }),
        }
      );

      if (!paymentResponse.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret: secret } = await paymentResponse.json();
      setClientSecret(secret);
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderAndPaymentIntent();
  };

  const handlePaymentSuccess = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch(clearAllCart() as any);
    router.push(`/checkout/success?order_id=${orderId}`);
  }, [dispatch, router, orderId]);

  const handlePaymentError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  return (
    <div className={styles.checkout}>
      <div className={styles.checkout__container}>
        {/* Header */}
        <div className={styles.checkout__header}>
          <h1 className={styles.checkout__title}>Checkout</h1>
          <div className={styles.checkout__steps}>
            <span className={styles.active}>Cart</span>
            <span>→</span>
            <span
              className={step === "shipping" ? styles.active : styles.completed}
            >
              Shipping
            </span>
            <span>→</span>
            <span className={step === "payment" ? styles.active : ""}>
              Payment
            </span>
            <span>→</span>
            <span>Confirmation</span>
          </div>
        </div>

        <div className={styles.checkout__layout}>
          {/* Main Content */}
          <div className={styles.checkout__main}>
            {error && (
              <div className={styles.checkout__error}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            {step === "shipping" && (
              <form onSubmit={handleShippingSubmit}>
                {/* Contact Information */}
                <section className={styles.checkout__section}>
                  <h2 className={styles["checkout__section-title"]}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Contact Information
                  </h2>

                  <div className={styles["checkout__form-grid"]}>
                    <div className={styles.checkout__field}>
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.checkout__field}>
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.checkout__field}>
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.checkout__field}>
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </section>

                {/* Shipping Address */}
                <section className={styles.checkout__section}>
                  <h2 className={styles["checkout__section-title"]}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Shipping Address
                  </h2>

                  <div className={styles["checkout__form-grid"]}>
                    <div
                      className={`${styles.checkout__field} ${styles["checkout__form-grid--full"]}`}
                    >
                      <label htmlFor="address">Street Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.checkout__field}>
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.checkout__field}>
                      <label htmlFor="state">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.checkout__field}>
                      <label htmlFor="zipCode">ZIP Code</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.checkout__field}>
                      <label htmlFor="country">Country</label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="VN">Vietnam</option>
                      </select>
                    </div>
                  </div>
                </section>

                <button
                  type="submit"
                  className={`btn btn--primary btn--lg ${styles.checkout__submit}`}
                  disabled={items.length === 0 || isCreatingOrder}
                >
                  {isCreatingOrder ? "Processing..." : "Continue to Payment"}
                </button>
              </form>
            )}

            {step === "payment" && clientSecret && orderId && (
              <section className={styles.checkout__section}>
                <h2 className={styles["checkout__section-title"]}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Payment Details
                </h2>

                <StripeProvider clientSecret={clientSecret}>
                  <PaymentForm
                    orderId={orderId}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </StripeProvider>

                <button
                  type="button"
                  className={styles.checkout__backBtn}
                  onClick={() => setStep("shipping")}
                >
                  ← Back to Shipping
                </button>
              </section>
            )}
          </div>

          {/* Order Summary */}
          <aside className={styles.checkout__summary}>
            <h2 className={styles["checkout__summary-title"]}>Order Summary</h2>

            {/* Items */}
            <div className={styles.checkout__items}>
              {items.length === 0 ? (
                <p
                  style={{
                    color: "var(--text-light-secondary)",
                    textAlign: "center",
                  }}
                >
                  Your cart is empty
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className={styles.checkout__item}>
                    <div className={styles["checkout__item-image"]}>
                      <span style={{ color: "#ff3366" }}>
                        {item.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className={styles["checkout__item-details"]}>
                      <div className={styles["checkout__item-name"]}>
                        {item.name}
                      </div>
                      <div className={styles["checkout__item-quantity"]}>
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className={styles["checkout__item-price"]}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className={styles.checkout__totals}>
              <div className={styles.checkout__row}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.checkout__row}>
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className={styles.checkout__row}>
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div
                className={`${styles.checkout__row} ${styles["checkout__row--total"]}`}
              >
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.checkout__secure}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Secure checkout powered by Stripe
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
