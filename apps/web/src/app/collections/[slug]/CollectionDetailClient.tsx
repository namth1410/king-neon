"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
  slug: string;
}

export default function CollectionDetailClient({
  slug,
}: CollectionDetailClientProps) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState<"all" | "in-stock">("all");
  const limit = 12;

  const { request, abortAll } = useApiRequest();

  // Fetch category by slug
  useEffect(() => {
    const fetchCategory = async () => {
      setIsCategoryLoading(true);
      try {
        const response = await api.get(`/categories/slug/${slug}`);
        setCategory(response.data);
      } catch (error) {
        console.error("Failed to fetch category:", error);
        router.push("/collections");
      } finally {
        setIsCategoryLoading(false);
      }
    };
    fetchCategory();
  }, [slug, router]);

  // Fetch products for this category
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

  useEffect(() => {
    if (category) {
      fetchProducts();
    }
    return () => abortAll();
  }, [fetchProducts, category, abortAll]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, availability]);

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

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (isCategoryLoading) {
    return (
      <div className={styles.collection}>
        <div className={styles["collection__banner--skeleton"]} />
        <div className={styles.collection__container}>
          <div className={styles.collection__grid}>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={styles["collection__skeleton"]} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  onChange={() => setAvailability("all")}
                />
                <span>All</span>
              </label>
              <label className={styles["collection__filter-option"]}>
                <input
                  type="radio"
                  name="availability"
                  checked={availability === "in-stock"}
                  onChange={() => setAvailability("in-stock")}
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
                      onClick={() => setSearchQuery("")}
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
                    className={`${styles["collection__pagination-btn"]} ${
                      page === p ? styles.active : ""
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className={styles["collection__pagination-btn"]}
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
