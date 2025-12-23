"use client";

import { useCallback, useRef, useEffect } from "react";

// Draft expiration time: 7 days
const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

// Storage key prefix
const STORAGE_PREFIX = "king-neon:draft:";

/**
 * Base interface for draft metadata
 */
interface DraftMetadata {
  lastModified: number;
  version: number;
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a draft is still valid (not expired)
 */
function isDraftValid<T extends DraftMetadata>(draft: T | null): boolean {
  if (!draft || !draft.lastModified) return false;
  return Date.now() - draft.lastModified < DRAFT_EXPIRY_MS;
}

/**
 * Custom hook for managing draft storage with localStorage
 *
 * @param key - Unique identifier for the draft (will be prefixed with STORAGE_PREFIX)
 * @param debounceMs - Debounce time for auto-save in milliseconds (default: 1000)
 */
export function useDraftStorage<T extends DraftMetadata>(
  key: string,
  debounceMs: number = 1000
) {
  const storageKey = `${STORAGE_PREFIX}${key}`;
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAvailable = useRef(isLocalStorageAvailable());

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Save draft to localStorage
   */
  const saveDraft = useCallback(
    (data: Omit<T, "lastModified" | "version"> & Partial<DraftMetadata>) => {
      if (!isAvailable.current) return;

      try {
        const draftData: T = {
          ...data,
          lastModified: Date.now(),
          version: 1,
        } as T;

        localStorage.setItem(storageKey, JSON.stringify(draftData));
      } catch (error) {
        // Silently fail - quota exceeded or other storage errors
        console.warn("Failed to save draft:", error);
      }
    },
    [storageKey]
  );

  /**
   * Save draft with debounce (for auto-save on state changes)
   */
  const saveDraftDebounced = useCallback(
    (data: Omit<T, "lastModified" | "version"> & Partial<DraftMetadata>) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        saveDraft(data);
      }, debounceMs);
    },
    [saveDraft, debounceMs]
  );

  /**
   * Load draft from localStorage
   * Returns null if no draft exists, draft is expired, or draft is invalid
   */
  const loadDraft = useCallback((): T | null => {
    if (!isAvailable.current) return null;

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const draft = JSON.parse(stored) as T;

      // Check expiration
      if (!isDraftValid(draft)) {
        // Auto-cleanup expired drafts
        localStorage.removeItem(storageKey);
        return null;
      }

      return draft;
    } catch (error) {
      console.warn("Failed to load draft:", error);
      return null;
    }
  }, [storageKey]);

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback(() => {
    if (!isAvailable.current) return;

    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Failed to clear draft:", error);
    }
  }, [storageKey]);

  /**
   * Check if a valid draft exists
   */
  const hasDraft = useCallback((): boolean => {
    return loadDraft() !== null;
  }, [loadDraft]);

  /**
   * Get time since last modification in human-readable format
   */
  const getTimeSinceModified = useCallback((): string | null => {
    const draft = loadDraft();
    if (!draft) return null;

    const diffMs = Date.now() - draft.lastModified;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60)
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }, [loadDraft]);

  return {
    saveDraft,
    saveDraftDebounced,
    loadDraft,
    clearDraft,
    hasDraft,
    getTimeSinceModified,
    isAvailable: isAvailable.current,
  };
}

// Export draft interfaces for pages
export interface NeonDesignerDraft extends DraftMetadata {
  text: string;
  fontId: string;
  colorId: string;
  sizeId: string;
  materialId: string;
  backboardId: string;
  backboardColorId: string;
  mountingId: string;
  remoteId: string;
}

export interface NeonConfigurator3DDraft extends DraftMetadata {
  mode: "text" | "logo";
  text: string;
  color: string;
  fontFamily: string;
  size: number;
  backboard: string;
  borderWidth: number;
  textAlign: "left" | "center" | "right";
  // Logo mode
  logoSize: number;
  logoOutlineWidth: number;
  logoProcessingMethod: string;
  // Note: Not storing logoImage/backgroundImage to avoid quota issues
}

// Storage keys
export const DRAFT_KEYS = {
  NEON_DESIGNER: "neon-designer",
  NEON_CONFIGURATOR_3D: "neon-configurator-3d",
} as const;
