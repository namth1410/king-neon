"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsRes = await api.get("/products");
        const products = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data.data || [];

        interface OrderData {
          status: string;
          total?: string | number;
        }
        let orders: OrderData[] = [];
        try {
          const ordersRes = await api.get("/orders");
          orders = Array.isArray(ordersRes.data)
            ? ordersRes.data
            : ordersRes.data.data || [];
        } catch {
          // No orders yet
        }

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
          totalRevenue: orders.reduce(
            (sum, o) => sum + Number(o.total || 0),
            0
          ),
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout title="Dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Welcome Banner */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "16px",
            background:
              "linear-gradient(135deg, rgba(255,51,102,0.15) 0%, rgba(147,51,234,0.15) 50%, rgba(59,130,246,0.15) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "32px",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "white",
                marginBottom: "8px",
              }}
            >
              Welcome back! 👋
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                maxWidth: "600px",
                lineHeight: 1.6,
              }}
            >
              Here&apos;s what&apos;s happening with your store today. Manage
              products, process orders, and grow your business.
            </p>
          </div>
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "200px",
              height: "200px",
              background:
                "radial-gradient(circle, rgba(255,51,102,0.4) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(40px)",
            }}
          />
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            trend="+12.5%"
            icon={<TrendingUp size={20} />}
            color="#22c55e"
            loading={loading}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.toString()}
            trend="+8.2%"
            icon={<ShoppingCart size={20} />}
            color="#3b82f6"
            loading={loading}
          />
          <StatCard
            title="Products"
            value={stats.totalProducts.toString()}
            trend="+3%"
            icon={<Package size={20} />}
            color="#a855f7"
            loading={loading}
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders.toString()}
            trend="-2%"
            icon={<Users size={20} />}
            color="#f97316"
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          <QuickActionCard
            title="Manage Products"
            description="Add, edit, or remove products"
            href="/products"
            icon={<Package size={24} />}
            color="#ff3366"
          />
          <QuickActionCard
            title="View Orders"
            description="Process customer orders"
            href="/orders"
            icon={<ShoppingCart size={24} />}
            color="#3b82f6"
          />
          <QuickActionCard
            title="Neon Config"
            description="Manage fonts and colors"
            href="/neon-config"
            icon={<span style={{ fontSize: "24px" }}>✨</span>}
            color="#a855f7"
          />
        </div>

        {/* Bottom Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          {/* Recent Orders */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "white" }}>
                Recent Orders
              </h3>
              <Link
                href="/orders"
                style={{
                  fontSize: "14px",
                  color: "#ff3366",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <ShoppingCart
                size={48}
                style={{ margin: "0 auto 16px", opacity: 0.4 }}
              />
              <p>No orders yet</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>
                Orders will appear here when customers make purchases
              </p>
            </div>
          </div>

          {/* Store Overview */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "white",
                marginBottom: "20px",
              }}
            >
              Store Overview
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <OverviewRow
                label="Products Active"
                value={stats.totalProducts}
              />
              <OverviewRow
                label="Orders Processing"
                value={stats.pendingOrders}
              />
              <OverviewRow label="Neon Colors" value={12} />
              <OverviewRow label="Font Styles" value={8} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  trend,
  icon,
  color,
  loading,
}: {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}) {
  const isPositive = trend.startsWith("+");

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${color}15 0%, transparent 100%)`,
        border: `1px solid ${color}30`,
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.5)",
              marginBottom: "8px",
            }}
          >
            {title}
          </p>
          {loading ? (
            <div
              style={{
                height: "32px",
                width: "80px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "8px",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ) : (
            <p style={{ fontSize: "28px", fontWeight: 700, color: "white" }}>
              {value}
            </p>
          )}
        </div>
        <div
          style={{
            padding: "10px",
            borderRadius: "12px",
            background: `${color}20`,
            color: color,
          }}
        >
          {icon}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginTop: "12px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: isPositive ? "#22c55e" : "#ef4444",
          }}
        >
          {trend}
        </span>
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
          vs last month
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "-30px",
          right: "-30px",
          width: "100px",
          height: "100px",
          background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
          borderRadius: "50%",
        }}
      />
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "20px",
        transition: "all 0.3s",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = `1px solid ${color}50`;
        e.currentTarget.style.boxShadow = `0 0 30px ${color}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          marginBottom: "16px",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "white",
          marginBottom: "4px",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
        {description}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginTop: "12px",
          color: color,
          fontSize: "14px",
        }}
      >
        <span>View</span>
        <ChevronRight size={16} />
      </div>
    </Link>
  );
}

function OverviewRow({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
        {label}
      </span>
      <span style={{ color: "white", fontWeight: 600, fontSize: "16px" }}>
        {value}
      </span>
    </div>
  );
}
