"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import api from "@/utils/api";
import { useApiRequest, withSignal } from "@/hooks/useApiRequest";
import styles from "./collection-detail.module.scss";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  category: { id: string; name: string; slug: string } | null;
  images: string[];
  featuredImage: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

interface CollectionDetailClientProps {
  initialCategory: Category;
  initialProducts: Product[];
  initialTotal: number;
}

export default function CollectionDetailClient({
  initialCategory,
  initialProducts,
  initialTotal,
}: CollectionDetailClientProps) {
  const [category] = useState<Category>(initialCategory);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(initialTotal);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState<"all" | "in-stock">("all");
  const limit = 12;

  const { request, abortAll } = useApiRequest();

  // Fetch products when filters/pagination change (not on initial load)
  const fetchProducts = useCallback(async () => {
    if (!category) return;

    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        categoryId: category.id,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await request("products", (signal) =>
        api.get("/products", withSignal(signal, { params }))
      );

      // Response is null if request was aborted
      if (!response) return;

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
  }, [category, page, searchQuery, request]);

  // Only fetch when page or search changes (not on initial mount)
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (hasInteracted) {
      fetchProducts();
    }
    return () => abortAll();
  }, [fetchProducts, hasInteracted, abortAll]);

  // Reset page when filters change
  useEffect(() => {
    if (hasInteracted) {
      setPage(1);
    }
  }, [searchQuery, availability, hasInteracted]);

  // Handler for search/filter changes
  const handleSearchChange = (value: string) => {
    setHasInteracted(true);
    setSearchQuery(value);
  };

  const handlePageChange = (newPage: number) => {
    setHasInteracted(true);
    setPage(newPage);
  };

  const handleAvailabilityChange = (value: "all" | "in-stock") => {
    setHasInteracted(true);
    setAvailability(value);
  };

  // Sort products client-side
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
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
  }, [products, sortBy]);

  // Transform to ProductCard format
  const transformedProducts = useMemo(() => {
    return sortedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.basePrice,
      category:
        typeof p.category === "object" && p.category
          ? p.category.name
          : String(p.category || ""),
      image: p.images[0] || p.featuredImage || undefined,
    }));
  }, [sortedProducts]);

  const totalPages = Math.ceil(totalProducts / limit);

  // Handle search form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className={styles.collection}>
      {/* Banner */}
      <div
        className={styles.collection__banner}
        style={
          category.image
            ? { backgroundImage: `url(${category.image})` }
            : undefined
        }
      >
        <div className={styles["collection__banner-overlay"]} />
        <div className={styles["collection__banner-content"]}>
          <motion.h1
            className={styles["collection__banner-title"]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {category.name}
          </motion.h1>
          {category.description && (
            <motion.p
              className={styles["collection__banner-description"]}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {category.description}
            </motion.p>
          )}
        </div>
      </div>

      <div className={styles.collection__container}>
        <div className={styles.collection__layout}>
          {/* Sidebar Filters */}
          <aside className={styles.collection__sidebar}>
            {/* Search */}
            <form onSubmit={handleSearch} className={styles.collection__search}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={styles["collection__search-input"]}
              />
              <button
                type="submit"
                className={styles["collection__search-btn"]}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>

            {/* Availability Filter */}
            <div className={styles.collection__filter}>
              <h3 className={styles["collection__filter-title"]}>
                Availability
              </h3>
              <label className={styles["collection__filter-option"]}>
                <input
                  type="radio"
                  name="availability"
                  checked={availability === "all"}
                  onChange={() => handleAvailabilityChange("all")}
                />
                <span>All</span>
              </label>
              <label className={styles["collection__filter-option"]}>
                <input
                  type="radio"
                  name="availability"
                  checked={availability === "in-stock"}
                  onChange={() => handleAvailabilityChange("in-stock")}
                />
                <span>In Stock</span>
              </label>
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.collection__main}>
            {/* Toolbar */}
            <div className={styles.collection__toolbar}>
              <span className={styles.collection__count}>
                {isLoading
                  ? "Loading..."
                  : `${totalProducts} ${totalProducts === 1 ? "result" : "results"}`}
              </span>

              <div className={styles.collection__sort}>
                <span className={styles["collection__sort-label"]}>
                  Sort by:
                </span>
                <select
                  className={styles["collection__sort-select"]}
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
            <div className={styles.collection__grid}>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className={styles["collection__skeleton"]}>
                    <div className={styles["collection__skeleton-image"]} />
                    <div className={styles["collection__skeleton-text"]} />
                    <div className={styles["collection__skeleton-price"]} />
                  </div>
                ))
              ) : transformedProducts.length > 0 ? (
                transformedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))
              ) : (
                <div className={styles.collection__empty}>
                  <p>No products found</p>
                  {searchQuery && (
                    <button
                      className={styles["collection__empty-reset"]}
                      onClick={() => handleSearchChange("")}
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.collection__pagination}>
                <button
                  className={styles["collection__pagination-btn"]}
                  disabled={page === 1}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                >
                  ←
                </button>
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1
                ).map((p) => (
                  <button
                    key={p}
                    className={`${styles["collection__pagination-btn"]} ${
                      page === p ? styles.active : ""
                    }`}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className={styles["collection__pagination-btn"]}
                  disabled={page === totalPages}
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, page + 1))
                  }
                >
                  →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
