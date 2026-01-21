import React from "react";
import { X } from "lucide-react";

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "filter" | "selection" | "status";
  status?: "default" | "selected" | "error" | "warning" | "success";
  deletable?: boolean;
  onDelete?: () => void;
  avatar?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  variant = "selection",
  status = "default",
  deletable = false,
  onDelete,
  avatar,
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center gap-2 px-3 py-1 rounded-sm font-medium text-sm transition-colors";

  const statusStyles = {
    default: "bg-primary-50 text-primary-500",
    selected: "bg-primary-500 text-surface",
    error: "bg-error-50 text-error-600",
    warning: "bg-warning-50 text-warning-600",
    success: "bg-secondary-50 text-secondary-600",
  };

  const interactiveClass =
    variant === "filter" || variant === "selection"
      ? "cursor-pointer hover:opacity-90 active:scale-95"
      : "";

  const handleClick = (e: React.MouseEvent) => {
    if (variant === "filter") {
      // Toggle logic would go here
    }
    props.onClick?.(e);
  };

  return (
    <div
      className={`
        ${baseStyles}
        ${statusStyles[status]}
        ${interactiveClass}
        ${className}
      `}
      onClick={handleClick}
      role={variant === "filter" ? "button" : "presentation"}
      tabIndex={variant === "filter" ? 0 : undefined}
      {...props}
    >
      {avatar && <span className="flex-shrink-0">{avatar}</span>}
      <span>{children}</span>
      {deletable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="ml-1 -mr-1 p-0.5 rounded-sm hover:bg-black/10"
          aria-label="Delete chip"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
