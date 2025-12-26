"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/i18n/client";
import styles from "./Hero.module.scss";

const statsData = [
  { value: "50K+", labelKey: "hero.stats.customers" },
  { value: "100+", labelKey: "hero.stats.designs" },
  { value: "5★", labelKey: "hero.stats.rating" },
  { value: "2yr", labelKey: "hero.stats.warranty" },
];

export default function Hero() {
  const { t } = useTranslation("common");

  return (
    <section className={styles.hero}>
      {/* Background Effects */}
      <div className={styles.hero__background}>
        <div className={styles["hero__grid-lines"]} />
      </div>

      <div className={styles.hero__content}>
        {/* Badge */}
        <motion.div
          className={styles.hero__badge}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {t("hero.badge")}
        </motion.div>

        {/* Title */}
        <motion.h1
          className={styles.hero__title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t("hero.title")}{" "}
          <span className={styles.highlight}>{t("hero.titleHighlight")}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className={styles.hero__subtitle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className={styles.hero__cta}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/create" className="btn btn--primary btn--lg">
            {t("cta.createYourOwn")}
          </Link>
          <Link href="/collections" className="btn btn--outline btn--lg">
            {t("cta.browseCollections")}
          </Link>
        </motion.div>

        {/* Neon Preview */}
        <motion.div
          className={styles.hero__preview}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className={styles["hero__preview-wrapper"]}>
            <span className={styles["hero__preview-neon"]}>Hello World</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className={styles.hero__stats}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              className={styles.hero__stat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
            >
              <div className={styles["hero__stat-value"]}>{stat.value}</div>
              <div className={styles["hero__stat-label"]}>
                {t(stat.labelKey)}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className={styles.hero__scroll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span>{t("hero.scrollHint")}</span>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </section>
  );
}
