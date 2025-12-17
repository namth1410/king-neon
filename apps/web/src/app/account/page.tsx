"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./account.module.scss";
import api from "@/utils/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        setUser(response.data);
      } catch {
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    // Mock orders
    setOrders([
      {
        id: "1",
        orderNumber: "KN-2024-001",
        createdAt: "2024-12-15",
        status: "delivered",
        total: 299,
      },
      {
        id: "2",
        orderNumber: "KN-2024-002",
        createdAt: "2024-12-10",
        status: "shipped",
        total: 449,
      },
      {
        id: "3",
        orderNumber: "KN-2024-003",
        createdAt: "2024-12-05",
        status: "processing",
        total: 175,
      },
    ]);

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className={styles.account}>
        <div className={styles.account__container}>
          <div style={{ textAlign: "center", padding: "4rem" }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.account}>
      <div className={styles.account__container}>
        <div className={styles.account__layout}>
          {/* Sidebar */}
          <aside className={styles.account__sidebar}>
            <div className={styles.account__user}>
              <div className={styles["account__user-avatar"]}>
                {user?.name?.[0] || "U"}
              </div>
              <div className={styles["account__user-name"]}>{user?.name}</div>
              <div className={styles["account__user-email"]}>{user?.email}</div>
            </div>

            <nav className={styles.account__nav}>
              <button
                className={`${styles["account__nav-link"]} ${activeTab === "profile" ? styles.active : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile
              </button>

              <button
                className={`${styles["account__nav-link"]} ${activeTab === "orders" ? styles.active : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Orders
              </button>

              <button
                className={`${styles["account__nav-link"]} ${activeTab === "designs" ? styles.active : ""}`}
                onClick={() => setActiveTab("designs")}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                My Designs
              </button>

              <Link
                href="/account/addresses"
                className={styles["account__nav-link"]}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                Addresses
              </Link>

              <button
                className={`${styles["account__nav-link"]} ${styles["account__nav-logout"]}`}
                onClick={handleLogout}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className={styles.account__content}>
            {activeTab === "profile" && <ProfileTab user={user} />}
            {activeTab === "orders" && <OrdersTab orders={orders} />}
            {activeTab === "designs" && <DesignsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Tab
function ProfileTab({ user }: { user: User | null }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile updated! (Demo mode)");
  };

  return (
    <>
      <div className={styles.account__header}>
        <h1 className={styles.account__title}>Profile Settings</h1>
        <p className={styles.account__subtitle}>
          Manage your personal information
        </p>
      </div>

      <section className={styles.account__section}>
        <h2 className={styles["account__section-title"]}>
          Personal Information
        </h2>
        <form className={styles.account__form} onSubmit={handleSubmit}>
          <div className={styles.account__field}>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.account__field}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
            />
          </div>

          <div className={styles.account__field}>
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className={styles.account__actions}>
            <button type="submit" className="btn btn--primary">
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

// Orders Tab
function OrdersTab({ orders }: { orders: Order[] }) {
  const getStatusClass = (status: string) => {
    return styles[`account__order-status--${status}`] || "";
  };

  return (
    <>
      <div className={styles.account__header}>
        <h1 className={styles.account__title}>Order History</h1>
        <p className={styles.account__subtitle}>View and track your orders</p>
      </div>

      <section className={styles.account__section}>
        {orders.length === 0 ? (
          <div className={styles.account__empty}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p>No orders yet</p>
            <Link href="/collections" className="btn btn--primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className={styles.account__orders}>
            {orders.map((order) => (
              <div key={order.id} className={styles.account__order}>
                <div className={styles["account__order-image"]}>
                  <span style={{ color: "#ff3366" }}>KN</span>
                </div>
                <div className={styles["account__order-details"]}>
                  <div className={styles["account__order-number"]}>
                    {order.orderNumber}
                  </div>
                  <div className={styles["account__order-date"]}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={`${styles["account__order-status"]} ${getStatusClass(order.status)}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <div className={styles["account__order-total"]}>
                  ${order.total}
                </div>
                <Link
                  href={`/account/orders/${order.id}`}
                  className={styles["account__order-action"]}
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// Designs Tab
function DesignsTab() {
  return (
    <>
      <div className={styles.account__header}>
        <h1 className={styles.account__title}>My Designs</h1>
        <p className={styles.account__subtitle}>
          Your saved custom neon designs
        </p>
      </div>

      <section className={styles.account__section}>
        <div className={styles.account__empty}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <p>No saved designs yet</p>
          <Link href="/create" className="btn btn--primary">
            Create Your First Design
          </Link>
        </div>
      </section>
    </>
  );
}
