"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
    } else {
      const storedUser = localStorage.getItem("admin_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user", e);
        }
      }
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "white",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(255,51,102,0.2)",
            borderTopColor: "#ff3366",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "white",
      }}
    >
      <Toaster position="top-right" richColors />
      <Sidebar />

      {/* Main Content - offset by sidebar width */}
      <main
        style={{
          flex: 1,
          marginLeft: "256px",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <header
          style={{
            height: "64px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "white" }}>
            {title || "Dashboard"}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div
                style={{ fontSize: "14px", fontWeight: 500, color: "white" }}
              >
                {user?.name || "Admin"}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                {user?.email || "admin@kingneon.com"}
              </div>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #ff3366 0%, rgba(255,51,102,0.5) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "white",
                fontSize: "16px",
                boxShadow: "0 0 20px rgba(255,51,102,0.3)",
              }}
            >
              {user?.name?.[0] || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: "24px 32px", flex: 1 }}>{children}</div>
      </main>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
