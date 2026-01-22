// import React from "react";
// import { useDesignTokens } from "../../design-system/theme/ThemeProvider";

// export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
//   elevation?: 0 | 1 | 2 | 3 | 4 | 5;
//   interactive?: boolean;
//   padding?: "none" | "small" | "medium" | "large";
// }

// export const Card: React.FC<CardProps> = ({
//   elevation = 1,
//   interactive = false,
//   padding = "medium",
//   children,
//   className = "",
//   ...props
// }) => {
//   const tokens = useDesignTokens();

//   const elevationClasses = {
//     0: "shadow-none",
//     1: "shadow-1",
//     2: "shadow-2",
//     3: "shadow-3",
//     4: "shadow-4",
//     5: "shadow-5",
//   };

//   const paddingClasses = {
//     none: "p-0",
//     small: `p-${tokens.spacing.sm}`,
//     medium: `p-${tokens.spacing.md}`,
//     large: `p-${tokens.spacing.lg}`,
//   };

//   const interactiveClasses = interactive
//     ? "cursor-pointer hover:shadow-2 transition-shadow duration-200 active:shadow-1"
//     : "";

//   return (
//     <div
//       className={`
//         bg-surface
//         rounded-md
//         ${elevationClasses[elevation]}
//         ${paddingClasses[padding]}
//         ${interactiveClasses}
//         ${className}
//       `}
//       {...props}
//     >
//       {children}
//     </div>
//   );
// };

// // Card Subcomponents
// export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
//   children,
//   className = "",
//   ...props
// }) => (
//   <div className={`pb-3 border-b border-gray-200 ${className}`} {...props}>
//     {children}
//   </div>
// );

// export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
//   children,
//   className = "",
//   ...props
// }) => (
//   <div className={`py-3 ${className}`} {...props}>
//     {children}
//   </div>
// );

// export const CardActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
//   children,
//   className = "",
//   ...props
// }) => (
//   <div
//     className={`pt-3 border-t border-gray-200 flex gap-2 ${className}`}
//     {...props}
//   >
//     {children}
//   </div>
// );

import React from 'react';

/**
 * Nightingale Card Variants:
 * - 'elevated': MD3 Shadow-1/2 for depth (Primary interaction)
 * - 'filled': Subtle surface color (Secondary/Grouping)
 * - 'outlined': Thin border, no shadow (High-density data)
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'filled' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  variant = 'elevated', 
  padding = 'md', 
  children, 
  className = '',
  ...props 
}) => {
  // Mapping padding tokens from globals.css
  const paddingMap = {
    none: 'p-0',
    sm: 'p-sm', // 8px
    md: 'p-md', // 16px
    lg: 'p-lg', // 24px
  };

  // Variant Styles based on MD3 Guidelines
  const variantStyles = {
    elevated: 'bg-surface shadow-1 hover:shadow-2 border border-black/5',
    filled: 'bg-gray-50 border-none',
    outlined: 'bg-surface border border-gray-200 shadow-none',
  };

  return (
    <div 
      className={`
        rounded-md transition-all duration-200 ease-in-out
        ${variantStyles[variant]}
        ${paddingMap[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

/** * Contextual Header for Clinical/Insurance Data
 */
export const CardHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ 
  title, 
  subtitle, 
  action 
}) => (
  <div className="flex items-start justify-between mb-md">
    <div>
      <h3 className="text-h3 font-semibold text-text-high leading-tight">{title}</h3>
      {subtitle && <p className="text-label text-text-medium mt-1">{subtitle}</p>}
    </div>
    {action && <div className="ml-md">{action}</div>}
  </div>
);

/**
 * Action Container for the bottom of cards
 */
export const CardActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-lg pt-md border-t border-gray-100 flex gap-sm items-center">
    {children}
  </div>
);