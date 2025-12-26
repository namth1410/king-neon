"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./not-found.module.scss";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* Background effect */}
      <div className={styles.backgroundGlow} />

      <div className={styles.content}>
        {/* 404 Number */}
        <h1 className={styles.errorCode}>404</h1>

        {/* Message */}
        <h2 className={styles.title}>Trang không tìm thấy</h2>
        <p className={styles.description}>
          Trang bạn đang tìm kiếm không tồn tại trong hệ thống quản trị.
        </p>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button onClick={() => router.back()} className={styles.backButton}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>

          <Link href="/" className={styles.homeButton}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Quick links */}
        <div className={styles.quickLinks}>
          <span>Truy cập nhanh:</span>
          <Link href="/orders">Đơn hàng</Link>
          <Link href="/products">Sản phẩm</Link>
          <Link href="/customers">Khách hàng</Link>
        </div>
      </div>
    </div>
  );
}
