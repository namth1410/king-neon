import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
}: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md
        ${paddingStyles[padding]}
        ${hover ? "transition-shadow duration-200 hover:shadow-lg" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
