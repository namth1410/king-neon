/**
 * Loading components for apps/web
 * Uses unified Spinner from @king-neon/ui package
 */
import React from "react";
import { Spinner, type SpinnerSize } from "@king-neon/ui";
import styles from "./Loading.module.scss";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  color?: string;
}

/**
 * Basic loading spinner
 * @deprecated Use Spinner from @king-neon/ui directly
 */
export const LoadingSpinner = ({
  size = "md",
  className = "",
  color,
}: LoadingSpinnerProps) => {
  return <Spinner size={size} className={className} color={color} />;
};

// Re-export Spinner for convenience
export { Spinner };

interface LoadingOverlayProps {
  message?: string;
  size?: SpinnerSize;
}

/**
 * Full-page loading overlay with optional message
 */
export const LoadingOverlay = ({
  message,
  size = "lg",
}: LoadingOverlayProps) => {
  return (
    <div className={styles.overlay}>
      <Spinner size={size} color="#ff3366" />
      {message && <span className={styles.overlayMessage}>{message}</span>}
    </div>
  );
};
