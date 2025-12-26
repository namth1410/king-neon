"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./not-found.module.scss";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* Animated background */}
      <div className={styles.backgroundGlow} />

      <div className={styles.content}>
        {/* 404 Number with neon effect */}
        <h1 className={styles.errorCode}>
          <span className={styles.neonText}>4</span>
          <span className={styles.neonTextAlt}>0</span>
          <span className={styles.neonText}>4</span>
        </h1>

        {/* Message */}
        <h2 className={styles.title}>Trang không tồn tại</h2>
        <p className={styles.description}>
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button onClick={() => router.back()} className={styles.backButton}>
            <svg
              width="20"
              height="20"
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
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Về trang chủ
          </Link>
        </div>

        {/* Suggestion links */}
        <div className={styles.suggestions}>
          <p className={styles.suggestionsTitle}>Có thể bạn muốn tìm:</p>
          <div className={styles.suggestionsLinks}>
            <Link href="/products">Sản phẩm</Link>
            <Link href="/create">Tạo biển hiệu</Link>
            <Link href="/collections">Bộ sưu tập</Link>
            <Link href="/about">Về chúng tôi</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
