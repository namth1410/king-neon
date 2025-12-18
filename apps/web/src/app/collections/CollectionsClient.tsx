"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import api from "@/utils/api";
import styles from "./collections.module.scss";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
}

// Gradient fallbacks for categories without images
const gradientColors = [
  "linear-gradient(135deg, hsl(330, 70%, 25%) 0%, hsl(350, 70%, 15%) 100%)",
  "linear-gradient(135deg, hsl(210, 70%, 25%) 0%, hsl(230, 70%, 15%) 100%)",
  "linear-gradient(135deg, hsl(150, 70%, 25%) 0%, hsl(170, 70%, 15%) 100%)",
  "linear-gradient(135deg, hsl(270, 70%, 25%) 0%, hsl(290, 70%, 15%) 100%)",
  "linear-gradient(135deg, hsl(45, 70%, 25%) 0%, hsl(35, 70%, 15%) 100%)",
  "linear-gradient(135deg, hsl(180, 70%, 25%) 0%, hsl(200, 70%, 15%) 100%)",
  "linear-gradient(135deg, hsl(0, 70%, 25%) 0%, hsl(20, 70%, 15%) 100%)",
  "linear-gradient(135deg, hsl(60, 70%, 25%) 0%, hsl(80, 70%, 15%) 100%)",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function CollectionsClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories/active");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Limit to 8 categories for gallery display
  const displayCategories = categories.slice(0, 8);

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
          <h1 className={styles.collections__title}>Neon Sign Collection</h1>
          <p className={styles.collections__subtitle}>
            Explore our curated collections of premium LED neon signs for every
            occasion
          </p>
        </motion.div>

        {/* Category Gallery Grid */}
        {isLoading ? (
          <div className={styles.collections__gallery}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`${styles.collections__card} ${styles["collections__card--skeleton"]}`}
              >
                <div className={styles["collections__card-skeleton"]} />
              </div>
            ))}
          </div>
        ) : displayCategories.length > 0 ? (
          <motion.div
            className={styles.collections__gallery}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {displayCategories.map((category, index) => (
              <motion.div key={category.id} variants={itemVariants}>
                <Link
                  href={`/collections/${category.slug}`}
                  className={`${styles.collections__card} ${
                    index === 0 ? styles["collections__card--large"] : ""
                  } ${index === 1 ? styles["collections__card--medium"] : ""}`}
                >
                  {/* Background Image or Gradient */}
                  <div className={styles["collections__card-bg"]}>
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={styles["collections__card-image"]}
                      />
                    ) : (
                      <div
                        className={styles["collections__card-gradient"]}
                        style={{
                          background:
                            gradientColors[index % gradientColors.length],
                        }}
                      />
                    )}
                  </div>

                  {/* Overlay */}
                  <div className={styles["collections__card-overlay"]} />

                  {/* Content */}
                  <div className={styles["collections__card-content"]}>
                    <span className={styles["collections__card-label"]}>
                      {category.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className={styles.collections__empty}>
            <p>No collections available</p>
          </div>
        )}
      </div>
    </div>
  );
}
