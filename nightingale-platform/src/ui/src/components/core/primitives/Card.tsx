import React from "react";
import { useDesignTokens } from "../../design-system/theme/ThemeProvider";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  interactive?: boolean;
  padding?: "none" | "small" | "medium" | "large";
}

export const Card: React.FC<CardProps> = ({
  elevation = 1,
  interactive = false,
  padding = "medium",
  children,
  className = "",
  ...props
}) => {
  const tokens = useDesignTokens();

  const elevationClasses = {
    0: "shadow-none",
    1: "shadow-1",
    2: "shadow-2",
    3: "shadow-3",
    4: "shadow-4",
    5: "shadow-5",
  };

  const paddingClasses = {
    none: "p-0",
    small: `p-${tokens.spacing.sm}`,
    medium: `p-${tokens.spacing.md}`,
    large: `p-${tokens.spacing.lg}`,
  };

  const interactiveClasses = interactive
    ? "cursor-pointer hover:shadow-2 transition-shadow duration-200 active:shadow-1"
    : "";

  return (
    <div
      className={`
        bg-surface
        rounded-md
        ${elevationClasses[elevation]}
        ${paddingClasses[padding]}
        ${interactiveClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Subcomponents
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`pb-3 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`py-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div
    className={`pt-3 border-t border-gray-200 flex gap-2 ${className}`}
    {...props}
  >
    {children}
  </div>
);
