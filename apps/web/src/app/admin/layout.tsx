import Sidebar from "@/components/Admin/Sidebar";
import styles from "./admin.module.scss";

export const metadata = {
  title: "Admin Dashboard - King Neon",
  description: "Manage products, orders, and users",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles["admin-layout"]}>
      <Sidebar />
      <main className={styles["admin-main"]}>
        <div className={styles["admin-content"]}>{children}</div>
      </main>
    </div>
  );
}
