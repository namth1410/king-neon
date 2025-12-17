"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCartItems, selectCartTotal } from "@/store";
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

export default function CheckoutPage() {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const shipping = subtotal > 200 ? 0 : 15;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would submit to the API
    alert("Order submitted! (Demo mode)");
  };

  return (
    <div className={styles.checkout}>
      <div className={styles.checkout__container}>
        {/* Header */}
        <div className={styles.checkout__header}>
          <h1 className={styles.checkout__title}>Checkout</h1>
          <div className={styles.checkout__steps}>
            <span className={styles.active}>Cart</span>
            <span>→</span>
            <span className={styles.active}>Shipping</span>
            <span>→</span>
            <span>Payment</span>
            <span>→</span>
            <span>Confirmation</span>
          </div>
        </div>

        <form className={styles.checkout__layout} onSubmit={handleSubmit}>
          {/* Main Content */}
          <div className={styles.checkout__main}>
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

            <button
              type="submit"
              className={`btn btn--primary btn--lg ${styles.checkout__submit}`}
              disabled={items.length === 0}
            >
              Place Order
            </button>

            <div className={styles.checkout__secure}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Secure checkout
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
