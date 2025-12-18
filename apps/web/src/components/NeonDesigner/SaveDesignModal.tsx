"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";
import styles from "./SaveDesignModal.module.scss";

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  isSaving: boolean;
}

export default function SaveDesignModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: SaveDesignModalProps) {
  const [designName, setDesignName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designName.trim()) {
      setError("Please enter a name for your design");
      return;
    }
    setError("");
    try {
      await onSave(designName.trim());
      setDesignName("");
      onClose();
    } catch {
      setError("Failed to save design. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>

            <div className={styles.header}>
              <Save size={24} />
              <h2>Save Your Design</h2>
            </div>

            <p className={styles.description}>
              Give your design a name so you can find it later in &quot;My
              Designs&quot;.
            </p>

            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="e.g., Wedding Sign, Bar Name..."
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  maxLength={50}
                  autoFocus
                />
                <span className={styles.charCount}>{designName.length}/50</span>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Design"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
