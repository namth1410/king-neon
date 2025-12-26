"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/i18n/client";
import { languages } from "@/i18n/settings";
import styles from "./LanguageSwitcher.module.scss";

const languageNames: Record<string, string> = {
  en: "EN",
  vi: "VI",
};

const languageFlags: Record<string, string> = {
  en: "🇺🇸",
  vi: "🇻🇳",
};

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = i18n.language || "en";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    // Save to cookie for persistence
    document.cookie = `i18next=${lng};path=/;max-age=31536000`;
    setIsOpen(false);
  };

  return (
    <div className={styles.switcher} ref={dropdownRef}>
      <button
        className={styles.switcher__toggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("language.switchLanguage")}
        aria-expanded={isOpen}
      >
        <svg
          className={styles.switcher__icon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
        <span className={styles.switcher__label}>
          {languageNames[currentLanguage]}
        </span>
        <svg
          className={`${styles.switcher__chevron} ${isOpen ? styles.open : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.switcher__dropdown}>
          {languages.map((lng) => (
            <button
              key={lng}
              className={`${styles.switcher__option} ${
                currentLanguage === lng ? styles.active : ""
              }`}
              onClick={() => handleLanguageChange(lng)}
            >
              <span className={styles.switcher__flag}>
                {languageFlags[lng]}
              </span>
              <span>{t(`language.${lng}`)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
