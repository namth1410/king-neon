"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Navigation progress bar that shows when navigating between pages.
 * Uses a thin pink bar at the top of the screen.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Track navigation start/end
  useEffect(() => {
    // Navigation complete - hide progress bar
    setIsNavigating(false);
    setProgress(100);

    const timer = setTimeout(() => {
      setProgress(0);
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept link clicks to show progress immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link) {
        const href = link.getAttribute("href");
        // Only show progress for internal navigation
        if (href && href.startsWith("/") && href !== pathname) {
          setIsNavigating(true);
          setProgress(30);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  // Animate progress while navigating
  useEffect(() => {
    if (!isNavigating) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isNavigating]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg shadow-pink-500/50 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
