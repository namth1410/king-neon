"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    // Check for token
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
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <header className="h-16 border-b border-white/10 bg-black/60 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-right hidden sm:block">
              <div className="font-medium text-white">
                {user?.name || "Admin"}
              </div>
              <div className="text-xs text-white/50">
                {user?.email || "admin@kingneon.com"}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff3366] to-[#ff3366]/50 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(255,51,102,0.3)]">
              {user?.name?.[0] || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 flex-1">{children}</div>
      </main>
    </div>
  );
}
