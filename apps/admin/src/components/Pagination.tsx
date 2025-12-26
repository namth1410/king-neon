"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/i18n/client";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsOnPage: number;
  limit: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  itemsOnPage,
  limit,
  onPageChange,
  itemName = "items",
}: PaginationProps) {
  const { t } = useTranslation("common");

  if (totalPages <= 1) return null;

  const start = Math.min((page - 1) * limit + 1, totalItems);
  const end = Math.min((page - 1) * limit + itemsOnPage, totalItems);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
        {t("pagination.showing", {
          start,
          end,
          total: totalItems,
          items: itemName,
        })}
      </span>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color:
              page === 1 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
            cursor: page === 1 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <ChevronLeft size={16} />
          {t("common.prev")}
        </button>
        <span
          style={{
            padding: "8px 16px",
            color: "white",
            fontSize: "14px",
          }}
        >
          {t("pagination.page", { current: page, total: totalPages })}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color:
              page === totalPages
                ? "rgba(255,255,255,0.3)"
                : "rgba(255,255,255,0.7)",
            cursor: page === totalPages ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {t("common.next")}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
