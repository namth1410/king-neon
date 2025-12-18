"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { selectCartCount, openCart } from "@/store";
import styles from "./Header.module.scss";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/create", label: "Create Your Own" },
  { href: "/quote", label: "Get Quote" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const dispatch = useDispatch();
  const currentPath = usePathname();
  const cartCount = useSelector(selectCartCount);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(openCart());
  };

  return (
    <>
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.header__container}>
          {/* Logo */}
          <Link href="/" className={styles.header__logo}>
            <span className={styles["header__logo-text"]}>KING NEON</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.header__nav}>
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? currentPath === "/"
                  : currentPath.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles["header__nav-link"]} ${
                    isActive ? styles.active : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className={styles.header__actions}>
            <button
              className={styles.header__cart}
              onClick={handleCartClick}
              aria-label="Open cart"
            >
              <svg
                className={styles["header__cart-icon"]}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className={styles["header__cart-count"]}>
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className={styles["header__menu-btn"]}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={`${styles["mobile-menu"]} ${styles.open}`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <button
              className={styles["mobile-menu__close"]}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <nav className={styles["mobile-menu__nav"]}>
              {navLinks.map((link, index) => {
                const isActive =
                  link.href === "/"
                    ? currentPath === "/"
                    : currentPath.startsWith(link.href);

                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`${styles["mobile-menu__link"]} ${
                        isActive ? styles.active : ""
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
