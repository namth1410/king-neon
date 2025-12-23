"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, RotateCcw, ArrowRight } from "lucide-react";
import styles from "./DraftRecoveryModal.module.scss";

interface DraftRecoveryModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onStartFresh: () => void;
  onClose: () => void;
  preview?: string;
  lastModified?: string;
}

export default function DraftRecoveryModal({
  isOpen,
  onContinue,
  onStartFresh,
  onClose,
  preview,
  lastModified,
}: DraftRecoveryModalProps) {
  if (!isOpen) return null;

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
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className={styles.header}>
              <div className={styles.icon}>📝</div>
              <h2 className={styles.title}>Continue Your Design?</h2>
            </div>

            {/* Content */}
            <div className={styles.content}>
              <p className={styles.description}>
                We found a design you were working on.
              </p>

              {lastModified && (
                <div className={styles.timestamp}>
                  <Clock size={14} />
                  <span>Last edited: {lastModified}</span>
                </div>
              )}

              {preview && (
                <div className={styles.preview}>
                  <span className={styles.previewLabel}>Preview:</span>
                  <span className={styles.previewText}>
                    &ldquo;
                    {preview.length > 50
                      ? `${preview.substring(0, 50)}...`
                      : preview}
                    &rdquo;
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button className={styles.secondaryBtn} onClick={onStartFresh}>
                <RotateCcw size={16} />
                Start Fresh
              </button>
              <button className={styles.primaryBtn} onClick={onContinue}>
                Continue Designing
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
