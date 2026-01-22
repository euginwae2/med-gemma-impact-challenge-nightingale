'use client';

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "sm" | "md" | "lg";
  // CHANGED: Accept ReactNode (e.g., <Mic />) instead of LucideIcon (Mic)
  icon?: React.ReactNode; 
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const sizeStyles = {
    sm: "min-h-[40px] px-4 py-1 text-label rounded-lg",
    md: "min-h-[48px] px-6 py-2 text-body rounded-xl", 
    lg: "min-h-[56px] px-8 py-3 text-h3 rounded-xl",
  };

  const variantStyles = {
    primary:
      "bg-primary-500 text-surface shadow-1 hover:bg-primary-600 hover:shadow-2 focus-visible:ring-primary-500",
    secondary:
      "bg-transparent border border-gray-300 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500",
    tertiary:
      "bg-transparent text-primary-500 hover:bg-primary-50 px-2 min-w-0 shadow-none",
    danger:
      "bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500 shadow-1",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
           {/* Spinner SVG omitted for brevity, keep your original */}
           <span className="animate-spin">...</span> 
          {children}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {/* CHANGED: Render the node directly */}
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </span>
      )}
    </button>
  );
};