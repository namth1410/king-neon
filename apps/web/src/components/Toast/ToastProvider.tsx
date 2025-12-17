"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import styles from "./Toast.module.scss";

export type ToastType = "success" | "error" | "info" | "warning";
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export interface ToastOptions {
  duration?: number; // Duration in ms, default 5000
  dismissible?: boolean; // Show close button, default true
  position?: ToastPosition; // Default 'top-right'
  stack?: boolean; // Stack toasts or show flat list, default true
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  options?: ToastOptions;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Toast Component
const ToastItem = ({
  toast,
  onRemove,
  index,
  total,
  stack,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
  index: number;
  total: number;
  stack: boolean;
}) => {
  const { id, message, type, options } = toast;

  // Auto dismiss
  React.useEffect(() => {
    const duration = options?.duration ?? 5000;
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, options?.duration, onRemove]);

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[type];

  // Stack calculation
  const offset = stack ? index * 10 : 0;
  const scale = stack ? 1 - index * 0.05 : 1;
  const opacity = stack ? 1 - index * 0.2 : 1;
  const zIndex = total - index;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{
        opacity,
        y: stack ? offset : 0,
        scale,
        zIndex,
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      style={{
        marginBottom: stack ? -50 : 12, // Overlap if stacked
      }}
      className={`${styles.toast} ${styles[`toast--${type}`]}`}
    >
      <div className={styles.toast__icon}>
        <Icon size={20} />
      </div>
      <div className={styles.toast__content}>
        <p>{message}</p>
      </div>
      {(options?.dismissible ?? true) && (
        <button onClick={() => onRemove(id)} className={styles.toast__close}>
          <X size={16} />
        </button>
      )}

      {/* Progress bar could go here */}
      {(options?.duration ?? 5000) > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{
            duration: (options?.duration ?? 5000) / 1000,
            ease: "linear",
          }}
          className={styles.toast__progress}
        />
      )}
    </motion.div>
  );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType, options?: ToastOptions) => {
      const id = Math.random().toString(36).substring(7);
      setToasts((prev) => [...prev, { id, message, type, options }]);
    },
    []
  );

  const success = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast(message, "success", options),
    [showToast]
  );
  const error = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast(message, "error", options),
    [showToast]
  );
  const info = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast(message, "info", options),
    [showToast]
  );
  const warning = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast(message, "warning", options),
    [showToast]
  );

  // Group toasts by position
  const getToastsByPosition = (position: ToastPosition) => {
    return toasts.filter(
      (t) => (t.options?.position || "top-right") === position
    );
  };

  const positions: ToastPosition[] = [
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
    "top-center",
    "bottom-center",
  ];

  return (
    <ToastContext.Provider
      value={{ showToast, success, error, info, warning, removeToast }}
    >
      {children}

      {/* Toast Containers */}
      {positions.map((position) => {
        const positionToasts = getToastsByPosition(position);
        if (positionToasts.length === 0) return null;

        return (
          <div
            key={position}
            className={`${styles.toastContainer} ${styles[`toastContainer--${position}`]}`}
          >
            <AnimatePresence mode="popLayout">
              {/* Reverse mapping for stack: Newest on top if bottom position, etc. */}
              {/* Actually for visual stack, we usually want newest first in array to be top */}
              {[...positionToasts].reverse().map((toast, index) => (
                <ToastItem
                  key={toast.id}
                  toast={toast}
                  onRemove={removeToast}
                  index={index}
                  total={positionToasts.length}
                  stack={toast.options?.stack ?? false}
                />
              ))}
            </AnimatePresence>
          </div>
        );
      })}
    </ToastContext.Provider>
  );
};
