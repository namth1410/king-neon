"use client";

import { Clock, RotateCcw, ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  preview,
  lastModified,
}: DraftRecoveryModalProps) {
  const { t } = useTranslation("common");

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className={styles.dialogContent}>
        <AlertDialogHeader className={styles.header}>
          <div className={styles.icon}>📝</div>
          <AlertDialogTitle className={styles.title}>
            {t("draftRecovery.title")}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription className={styles.description}>
          {t("draftRecovery.description")}
        </AlertDialogDescription>

        {lastModified && (
          <div className={styles.timestamp}>
            <Clock size={14} />
            <span>{t("draftRecovery.lastEdited", { time: lastModified })}</span>
          </div>
        )}

        {preview && (
          <div className={styles.preview}>
            <span className={styles.previewLabel}>
              {t("draftRecovery.preview")}
            </span>
            <span className={styles.previewText}>
              &ldquo;
              {preview.length > 50 ? `${preview.substring(0, 50)}...` : preview}
              &rdquo;
            </span>
          </div>
        )}

        <AlertDialogFooter className={styles.actions}>
          <button className={styles.secondaryBtn} onClick={onStartFresh}>
            <RotateCcw size={16} />
            {t("draftRecovery.startFresh")}
          </button>
          <button className={styles.primaryBtn} onClick={onContinue}>
            {t("draftRecovery.continue")}
            <ArrowRight size={16} />
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
