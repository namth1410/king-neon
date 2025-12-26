"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useTranslation } from "@/i18n/client";
import { languages } from "@/i18n/settings";

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
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("language.switchLanguage")}
        aria-expanded={isOpen}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 14px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px",
          color: "rgba(255,255,255,0.8)",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 500,
          transition: "all 0.2s",
          width: "100%",
        }}
      >
        <Globe size={16} />
        <span>{languageNames[currentLanguage]}</span>
        <ChevronDown
          size={14}
          style={{
            marginLeft: "auto",
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "rgba(20, 20, 30, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "6px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
            zIndex: 100,
            backdropFilter: "blur(20px)",
          }}
        >
          {languages.map((lng) => (
            <button
              key={lng}
              onClick={() => handleLanguageChange(lng)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                background:
                  currentLanguage === lng
                    ? "rgba(255,51,102,0.15)"
                    : "transparent",
                border: "none",
                borderRadius: "6px",
                color:
                  currentLanguage === lng ? "#ff3366" : "rgba(255,255,255,0.8)",
                cursor: "pointer",
                fontSize: "13px",
                textAlign: "left",
                transition: "background 0.15s",
              }}
            >
              <span style={{ fontSize: "16px" }}>{languageFlags[lng]}</span>
              <span>{t(`language.${lng}`)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
