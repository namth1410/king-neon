import React from "react";
import { Loader2, type LucideProps } from "lucide-react";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface SpinnerProps extends Omit<LucideProps, "size"> {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Custom color - defaults to currentColor */
  color?: string;
  /** Additional CSS classes */
  className?: string;
}

// Size mapping in pixels
const sizeMap: Record<SpinnerSize, number> = {
  xs: 14,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

/**
 * Unified Spinner component using Loader2 from lucide-react.
 * Use this component for all loading states across the project.
 *
 * @example
 * // Basic usage
 * <Spinner />
 *
 * // With size
 * <Spinner size="lg" />
 *
 * // With custom color
 * <Spinner color="#ff3366" />
 *
 * // With Tailwind classes
 * <Spinner className="text-pink-500" />
 */
export function Spinner({
  size = "md",
  color,
  className = "",
  style,
  ...props
}: SpinnerProps) {
  return (
    <Loader2
      size={sizeMap[size]}
      color={color}
      className={`animate-spin ${className}`}
      style={{
        animation: "spin 1s linear infinite",
        ...style,
      }}
      {...props}
    />
  );
}

// CSS keyframes for environments without Tailwind animate-spin
const spinKeyframes = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

// Inject keyframes if not already present
if (typeof document !== "undefined") {
  const styleId = "spinner-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = spinKeyframes;
    document.head.appendChild(style);
  }
}
