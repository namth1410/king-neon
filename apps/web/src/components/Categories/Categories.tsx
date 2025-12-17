"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./Categories.module.scss";

const categories = [
  {
    id: "wedding",
    title: "Wedding Signs",
    count: 42,
    image: "/images/categories/wedding.jpg",
    href: "/collections/wedding",
  },
  {
    id: "business",
    title: "Business Signs",
    count: 58,
    image: "/images/categories/business.jpg",
    href: "/collections/business",
  },
  {
    id: "home",
    title: "Home Decor",
    count: 35,
    image: "/images/categories/home.jpg",
    href: "/collections/home",
  },
  {
    id: "quotes",
    title: "Quotes & Words",
    count: 67,
    image: "/images/categories/quotes.jpg",
    href: "/collections/quotes",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Categories() {
  return (
    <section className={styles.categories}>
      <div className={styles.categories__container}>
        {/* Header */}
        <motion.div
          className={styles.categories__header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.categories__title}>Browse Collections</h2>
          <p className={styles.categories__subtitle}>
            Explore our curated collections of premium neon signs for every
            occasion
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className={styles.categories__grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link href={category.href} className={styles.categories__card}>
                <div className={styles["categories__card-image"]}>
                  {/* Placeholder gradient for now - will use actual images */}
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: `linear-gradient(135deg, 
                        hsl(${Math.random() * 360}, 70%, 20%) 0%, 
                        hsl(${Math.random() * 360}, 70%, 10%) 100%)`,
                    }}
                  />
                </div>
                <div className={styles["categories__card-overlay"]} />
                <div className={styles["categories__card-content"]}>
                  <div className={styles["categories__card-icon"]}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className={styles["categories__card-title"]}>
                    {category.title}
                  </h3>
                  <p className={styles["categories__card-count"]}>
                    {category.count} designs
                  </p>
                  <span className={styles["categories__card-cta"]}>
                    Explore
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
