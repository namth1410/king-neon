"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Image as ImageIcon,
  LogOut,
} from "lucide-react";
import styles from "./Sidebar.module.scss";

const MENU_ITEMS = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
    exact: true,
  },
  {
    title: "Products",
    icon: Package,
    href: "/admin/products",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/admin/orders",
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Backgrounds",
    icon: ImageIcon,
    href: "/admin/preview-backgrounds",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__logo}>
        <div className={styles["sidebar__logo-text"]}>
          KING<span>NEON</span>
        </div>
      </div>

      <nav className={styles.sidebar__nav}>
        <div className={styles.sidebar__menu}>
          {MENU_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.sidebar__link} ${
                  isActive ? styles.active : ""
                }`}
              >
                <item.icon />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={styles.sidebar__footer}>
        <div className={styles.sidebar__user}>
          <div className={styles["sidebar__user-avatar"]}>A</div>
          <div className={styles["sidebar__user-info"]}>
            <div className={styles["sidebar__user-name"]}>Admin User</div>
            <div className={styles["sidebar__user-role"]}>Administrator</div>
          </div>
          <LogOut
            size={16}
            className="text-gray-400 cursor-pointer hover:text-white"
          />
        </div>
      </div>
    </aside>
  );
}
