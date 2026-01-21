import React from "react";
import { useDesignTokens } from "../../design-system/theme/ThemeProvider"
import { SpacingToken } from "../../design-system/theme/tokens";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "fab";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  loading = false,
  startIcon,
  endIcon,
  children,
  disabled,
  className = "",
  ...props
}) => {
  const tokens = useDesignTokens();

  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: `bg-primary-500 text-surface hover:bg-primary-600 active:bg-primary-700 shadow-1 hover:shadow-2 active:shadow-inner`,
    secondary: `bg-transparent border border-gray-300 text-primary-500 hover:bg-primary-50 active:bg-primary-100 hover:border-primary-500`,
    tertiary: `bg-transparent text-primary-500 hover:bg-primary-50 active:bg-primary-100 underline-offset-2 hover:underline`,
    fab: `rounded-full bg-primary-500 text-surface shadow-3 hover:shadow-4 active:shadow-inner`,
  };

  const sizeStyles = {
    small: `text-sm px-3 py-2 min-h-10`,
    medium: `text-base px-4 py-3 min-h-12 rounded-xl`,
    large: `text-lg px-6 py-4 min-h-14 rounded-xl`,
    fab: `w-14 h-14 rounded-full`, // Fixed size for FAB
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const isFab = variant === "fab";

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${isFab ? sizeStyles.fab : sizeStyles[size]}
        ${widthStyle}
        ${className}
      `}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {startIcon && !loading && <span className="mr-2">{startIcon}</span>}
      {!isFab && children}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
};
