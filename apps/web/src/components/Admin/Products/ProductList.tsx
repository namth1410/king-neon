"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import api from "@/utils/api";
import styles from "./ProductList.module.scss";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  category: string;
  active: boolean;
  featuredImage?: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products", {
          params: {
            search: search || undefined,
            limit: 20, // Default limit
          },
        });
        console.log("Products response:", res.data); // Debugging
        // Handle both { data: [...] } (paginated) and [...] (array) response formats
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]); // Re-fetch when search changes

  return (
    <div className={styles["product-list"]}>
      <header className={styles["product-list__header"]}>
        <div className={styles["product-list__controls"]}>
          <div className={styles["product-list__search"]}>
            <Search />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <Link
          href="/admin/products/create"
          className="btn btn--primary btn--sm"
        >
          <Plus size={16} style={{ marginRight: "0.5rem" }} />
          Create Product
        </Link>
      </header>

      <div className={styles["product-list__table-wrapper"]}>
        <table className={styles["product-list__table"]}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#666",
                  }}
                >
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles["product-list__product"]}>
                      <img
                        src={
                          product.featuredImage || "/placeholder-product.png"
                        }
                        alt={product.name}
                        className={styles["product-list__product-image"]}
                      />
                      <div className={styles["product-list__product-info"]}>
                        <div className={styles["product-list__product-name"]}>
                          {product.name}
                        </div>
                        <div className={styles["product-list__product-slug"]}>
                          /{product.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>
                    {product.category?.replace("-", " ")}
                  </td>
                  <td>${Number(product.basePrice).toFixed(2)}</td>
                  <td>
                    <span
                      className={`${styles["product-list__status"]} ${
                        product.active
                          ? styles["product-list__status--active"]
                          : styles["product-list__status--inactive"]
                      }`}
                    >
                      {product.active ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <div
                      className={styles["product-list__actions"]}
                      style={{ justifyContent: "flex-end" }}
                    >
                      <Link
                        href={`/admin/products/${product.id}`}
                        className={styles["product-list__actions-btn"]}
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        className={`${styles["product-list__actions-btn"]} ${styles["product-list__actions-btn--delete"]}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
