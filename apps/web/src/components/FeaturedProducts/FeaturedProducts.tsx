"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { useTranslation } from "@/i18n/client";
import api from "@/utils/api";
import styles from "./FeaturedProducts.module.scss";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  category: { id: string; name: string; slug: string } | null;
  images: string[];
  featuredImage: string | null;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation("common");

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get("/products/featured", {
          params: { limit: 4 },
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  // Transform API data to match ProductCard interface
  const transformedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.basePrice,
    category: p.category?.name || "",
    image: p.images[0] || p.featuredImage || undefined,
  }));

  return (
    <section className={styles.featured}>
      <div className={styles.featured__container}>
        {/* Header */}
        <motion.div
          className={styles.featured__header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.featured__title}>
            {t("product.featuredProducts")}
          </h2>
          <Link href="/collections" className={styles.featured__link}>
            {t("common.viewAll")}
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>

        {/* Grid */}
        <div className={styles.featured__grid}>
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={styles.featured__skeleton}>
                <div className={styles["featured__skeleton-image"]} />
                <div className={styles["featured__skeleton-text"]} />
                <div className={styles["featured__skeleton-price"]} />
              </div>
            ))
          ) : transformedProducts.length > 0 ? (
            transformedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))
          ) : (
            <div className={styles.featured__empty}>
              <p>{t("product.noFeatured")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
