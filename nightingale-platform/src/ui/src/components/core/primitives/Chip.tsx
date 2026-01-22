// import React from "react";
// import { X } from "lucide-react";

// export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
//   variant?: "filter" | "selection" | "status";
//   status?: "default" | "selected" | "error" | "warning" | "success";
//   deletable?: boolean;
//   onDelete?: () => void;
//   avatar?: React.ReactNode;
// }

// export const Chip: React.FC<ChipProps> = ({
//   variant = "selection",
//   status = "default",
//   deletable = false,
//   onDelete,
//   avatar,
//   children,
//   className = "",
//   ...props
// }) => {
//   const baseStyles =
//     "inline-flex items-center gap-2 px-3 py-1 rounded-sm font-medium text-sm transition-colors";

//   const statusStyles = {
//     default: "bg-primary-50 text-primary-500",
//     selected: "bg-primary-500 text-surface",
//     error: "bg-error-50 text-error-600",
//     warning: "bg-warning-50 text-warning-600",
//     success: "bg-secondary-50 text-secondary-600",
//   };

//   const interactiveClass =
//     variant === "filter" || variant === "selection"
//       ? "cursor-pointer hover:opacity-90 active:scale-95"
//       : "";

//   const handleClick = (e: React.MouseEvent) => {
//     if (variant === "filter") {
//       // Toggle logic would go here
//     }
//     props.onClick?.(e);
//   };

//   return (
//     <div
//       className={`
//         ${baseStyles}
//         ${statusStyles[status]}
//         ${interactiveClass}
//         ${className}
//       `}
//       onClick={handleClick}
//       role={variant === "filter" ? "button" : "presentation"}
//       tabIndex={variant === "filter" ? 0 : undefined}
//       {...props}
//     >
//       {avatar && <span className="flex-shrink-0">{avatar}</span>}
//       <span>{children}</span>
//       {deletable && (
//         <button
//           type="button"
//           onClick={(e) => {
//             e.stopPropagation();
//             onDelete?.();
//           }}
//           className="ml-1 -mr-1 p-0.5 rounded-sm hover:bg-black/10"
//           aria-label="Delete chip"
//         >
//           <X size={14} />
//         </button>
//       )}
//     </div>
//   );
// };
import React from "react";
import { LucideIcon, X } from "lucide-react";

/**
 * Nightingale Chip Variants:
 * - 'filter': Toggleable state, used for narrowing health data.
 * - 'input': Represents an entity (e.g., a symptom or medication), usually removable.
 * - 'assist': Suggests an action (e.g., AI-generated follow-up questions).
 * - 'status': Non-interactive, indicates state (e.g., 'Insurance Approved').
 */
interface ChipProps {
  label: string;
  variant?: "filter" | "input" | "assist" | "status";
  selected?: boolean;
  onToggle?: (selected: boolean) => void;
  onDelete?: () => void;
  icon?: LucideIcon;
  color?: "primary" | "secondary" | "error" | "warning" | "neutral";
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = "assist",
  selected = false,
  onToggle,
  onDelete,
  icon: Icon,
  color = "neutral",
  className = "",
}) => {
  // Base classes for the 32px standard MD3 chip height
  const baseStyles =
    "inline-flex items-center gap-2 px-3 h-8 text-label font-medium rounded-sm transition-all duration-200 cursor-pointer select-none whitespace-nowrap border";

  // Color Mapping based on Design Tokens
  const colorVariants = {
    primary: selected
      ? "bg-primary-500 text-surface border-primary-500"
      : "bg-primary-50 text-primary-600 border-primary-100 hover:bg-primary-100",
    secondary: selected
      ? "bg-secondary-500 text-surface border-secondary-500"
      : "bg-secondary-50 text-secondary-600 border-secondary-100 hover:bg-secondary-100",
    error: "bg-error-50 text-error-600 border-error-100",
    warning: "bg-warning-50 text-warning-600 border-warning-100",
    neutral: selected
      ? "bg-text-high text-surface border-text-high"
      : "bg-surface text-text-medium border-gray-300 hover:bg-gray-50",
  };

  const handleClick = () => {
    if (onToggle) onToggle(!selected);
  };

  return (
    <div
      role={variant === "status" ? "status" : "button"}
      aria-pressed={selected}
      onClick={handleClick}
      className={`
        ${baseStyles} 
        ${colorVariants[color]} 
        ${variant === "status" ? "cursor-default" : ""}
        ${className}
      `}
    >
      {/* Leading Icon */}
      {Icon && (
        <Icon
          size={16}
          className={selected ? "text-current" : "text-text-low"}
        />
      )}

      <span>{label}</span>

      {/* Trailing Delete Icon for 'input' variant */}
      {variant === "input" && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="hover:bg-black/10 rounded-full p-0.5 -mr-1 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
