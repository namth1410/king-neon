"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./ProductCard.module.scss";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: string;
  image?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  // Use deterministic color based on product id to avoid hydration mismatch
  const neonColors = [
    "#ff3366",
    "#00d4ff",
    "#9d4edd",
    "#00ff88",
    "#ffff00",
    "#ff6b00",
  ];
  // Create a simple hash from product id for deterministic color selection
  const colorIndex =
    product.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    neonColors.length;
  const neonColor = neonColors[colorIndex];

  return (
    <motion.div
      className={styles["product-card"]}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/products/${product.slug}`}>
        <div className={styles["product-card__image"]}>
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div
              className={styles["product-card__image-placeholder"]}
              style={{
                color: neonColor,
                textShadow: `0 0 10px ${neonColor}, 0 0 20px ${neonColor}, 0 0 40px ${neonColor}`,
              }}
            >
              {product.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          {product.badge && (
            <span className={styles["product-card__badge"]}>
              {product.badge}
            </span>
          )}

          <button
            className={styles["product-card__wishlist"]}
            aria-label="Add to wishlist"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        <div className={styles["product-card__actions"]}>
          <button className="btn btn--primary" style={{ width: "100%" }}>
            Quick View
          </button>
        </div>

        <div className={styles["product-card__content"]}>
          <div className={styles["product-card__category"]}>
            {product.category}
          </div>
          <h3 className={styles["product-card__title"]}>{product.name}</h3>

          <div className={styles["product-card__price"]}>
            <span className={styles["product-card__price-current"]}>
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className={styles["product-card__price-original"]}>
                ${product.originalPrice}
              </span>
            )}
          </div>

          {product.rating && (
            <div className={styles["product-card__rating"]}>
              <div className={styles["product-card__rating-stars"]}>
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    fill={
                      i < Math.floor(product.rating!) ? "currentColor" : "none"
                    }
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ))}
              </div>
              <span className={styles["product-card__rating-count"]}>
                ({product.reviewCount})
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
