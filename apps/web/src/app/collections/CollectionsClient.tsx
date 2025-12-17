"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import api from "@/utils/api";
import styles from "./collections.module.scss";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  category: string;
  images: string[];
  featuredImage: string | null;
}

interface Category {
  category: string;
  count: number;
}

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

export default function CollectionsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 12;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/products/categories");
        const categoryList = response.data.map((c: Category) =>
          c.category
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase())
        );
        setCategories(["All", ...categoryList]);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
      };

      if (activeCategory !== "All") {
        // Convert display category back to API format (e.g., "Led Neon" -> "led-neon")
        params.category = activeCategory.toLowerCase().replace(/ /g, "-");
      }

      const response = await api.get("/products", { params });

      // Handle response - could be array or { data, total } object
      if (Array.isArray(response.data)) {
        setProducts(response.data);
        setTotalProducts(response.data.length);
      } else {
        setProducts(response.data.data || response.data);
        setTotalProducts(response.data.total || response.data.length);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [activeCategory]);

  // Sort products client-side
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.basePrice - b.basePrice;
      case "price-high":
        return b.basePrice - a.basePrice;
      case "newest":
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });

  // Transform to ProductCard format
  const transformedProducts = sortedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.basePrice,
    category: p.category.replace(/-/g, " "),
    image: p.images[0] || p.featuredImage || undefined,
  }));

  const totalPages = Math.ceil(totalProducts / limit);

  return (
    <div className={styles.collections}>
      <div className={styles.collections__container}>
        {/* Header */}
        <motion.div
          className={styles.collections__header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.collections__title}>Our Collections</h1>
          <p className={styles.collections__subtitle}>
            Discover our handcrafted LED neon signs for every occasion
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className={styles.collections__filters}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.collections__filter} ${
                activeCategory === category ? styles.active : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Toolbar */}
        <div className={styles.collections__toolbar}>
          <span className={styles.collections__count}>
            {isLoading
              ? "Loading..."
              : `Showing ${transformedProducts.length} products`}
          </span>

          <div className={styles.collections__sort}>
            <span className={styles["collections__sort-label"]}>Sort by:</span>
            <select
              className={styles["collections__sort-select"]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className={styles.collections__grid}>
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={styles.collections__skeleton}>
                <div className={styles["collections__skeleton-image"]} />
                <div className={styles["collections__skeleton-text"]} />
                <div className={styles["collections__skeleton-price"]} />
              </div>
            ))
          ) : transformedProducts.length > 0 ? (
            transformedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))
          ) : (
            <div className={styles.collections__empty}>
              <p>No products found in this category</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.collections__pagination}>
            <button
              className={styles["collections__pagination-btn"]}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ←
            </button>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1
            ).map((p) => (
              <button
                key={p}
                className={`${styles["collections__pagination-btn"]} ${
                  page === p ? styles.active : ""
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className={styles["collections__pagination-btn"]}
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
