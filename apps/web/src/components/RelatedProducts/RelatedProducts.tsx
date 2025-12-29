"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/i18n/client";
import api from "@/utils/api";
import styles from "./RelatedProducts.module.scss";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  images: string[];
  featuredImage: string | null;
}

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
}

export default function RelatedProducts({
  currentProductId,
  category,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation("common");

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await api.get("/products", {
          params: {
            category,
            limit: 5,
          },
        });
        // Filter out current product and limit to 4
        const filtered = response.data
          .filter((p: Product) => p.id !== currentProductId)
          .slice(0, 4);
        setProducts(filtered);
      } catch (err) {
        console.error("Failed to fetch related products", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (category) {
      fetchRelated();
    }
  }, [currentProductId, category]);

  if (isLoading || products.length === 0) {
    return null;
  }

  return (
    <section className={styles.relatedProducts}>
      <h2 className={styles.title}>{t("product.relatedProducts")}</h2>
      <div className={styles.grid}>
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className={styles.card}
          >
            <div className={styles.imageContainer}>
              <Image
                src={
                  product.images[0] ||
                  product.featuredImage ||
                  "/placeholder.jpg"
                }
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={styles.image}
              />
            </div>
            <div className={styles.info}>
              <h3 className={styles.name}>{product.name}</h3>
              <span className={styles.price} suppressHydrationWarning>
                ${Number(product.basePrice).toFixed(2)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
