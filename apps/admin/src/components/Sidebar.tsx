"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Users,
  LayoutDashboard,
  Settings,
  LogOut,
  Palette,
  FileText,
  Image,
  FolderTree,
} from "lucide-react";

const menuItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/products", icon: ShoppingBag, label: "Products" },
  { href: "/categories", icon: FolderTree, label: "Categories" },
  { href: "/orders", icon: FileText, label: "Orders" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/neon-config", icon: Palette, label: "Neon Config" },
  { href: "/preview-backgrounds", icon: Image, label: "Preview Backgrounds" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/login");
  };

  return (
    <aside
      style={{
        width: "256px",
        minWidth: "256px",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "white",
            marginBottom: "4px",
          }}
        >
          KING{" "}
          <span
            style={{
              color: "#ff3366",
              textShadow: "0 0 20px rgba(255,51,102,0.5)",
            }}
          >
            NEON
          </span>
        </h1>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            background: "rgba(255,51,102,0.15)",
            color: "#ff3366",
            padding: "3px 8px",
            borderRadius: "4px",
            border: "1px solid rgba(255,51,102,0.2)",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
        {menuItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                marginBottom: "4px",
                borderRadius: "10px",
                textDecoration: "none",
                transition: "all 0.2s",
                background: isActive ? "rgba(255,51,102,0.15)" : "transparent",
                color: isActive ? "#ff3366" : "rgba(255,255,255,0.6)",
                position: "relative",
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "3px",
                    height: "24px",
                    background: "#ff3366",
                    borderRadius: "0 4px 4px 0",
                    boxShadow: "0 0 10px #ff3366",
                  }}
                />
              )}
              <Icon size={20} />
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            width: "100%",
            borderRadius: "10px",
            border: "none",
            background: "rgba(239,68,68,0.1)",
            color: "#ef4444",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
