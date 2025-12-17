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
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-20 transition-all duration-300">
      <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight text-white mb-1">
          KING{" "}
          <span className="text-[#ff3366] drop-shadow-[0_0_10px_rgba(255,51,102,0.5)]">
            NEON
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold bg-[#ff3366]/20 text-[#ff3366] px-2 py-0.5 rounded border border-[#ff3366]/20 tracking-wider uppercase">
            Admin Panel
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavItem
          href="/"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          active={pathname === "/"}
        />
        <NavItem
          href="/products"
          icon={<ShoppingBag size={20} />}
          label="Products"
          active={pathname.startsWith("/products")}
        />
        <NavItem
          href="/orders"
          icon={<FileText size={20} />}
          label="Orders"
          active={pathname.startsWith("/orders")}
        />
        <NavItem
          href="/customers"
          icon={<Users size={20} />}
          label="Customers"
          active={pathname.startsWith("/customers")}
        />
        <NavItem
          href="/neon-config"
          icon={<Palette size={20} />}
          label="Neon Config"
          active={pathname.startsWith("/neon-config")}
        />
        <NavItem
          href="/settings"
          icon={<Settings size={20} />}
          label="Settings"
          active={pathname.startsWith("/settings")}
        />
      </nav>

      <div className="p-4 border-t border-[#222]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all duration-200 group relative overflow-hidden ${
        active
          ? "bg-[#ff3366]/10 text-[#ff3366]"
          : "text-gray-400 hover:text-white"
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r from-[#ff3366]/10 to-transparent opacity-0 transition-opacity duration-200 ${active ? "opacity-100" : "group-hover:opacity-100"}`}
      />
      <span className="relative z-10">{icon}</span>
      <span className="font-medium relative z-10">{label}</span>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#ff3366] rounded-r-full shadow-[0_0_10px_#ff3366]" />
      )}
    </Link>
  );
}
