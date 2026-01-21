import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useDesignTokens } from "../../design-system/theme/ThemeProvider";

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  success?: boolean;
  fullWidth?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  helperText,
  error = false,
  success = false,
  fullWidth = false,
  startAdornment,
  endAdornment,
  id,
  className = "",
  ...props
}) => {
  const tokens = useDesignTokens();

  const generatedId = React.useId();
  const inputId = id || generatedId;

  const borderColor = error
    ? "border-error-500 focus:border-error-500"
    : success
      ? "border-secondary-500 focus:border-secondary-500"
      : "border-gray-300 focus:border-primary-500";

  const helperTextColor = error
    ? "text-error-500"
    : success
      ? "text-secondary-500"
      : "text-gray-600";

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {startAdornment && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {startAdornment}
          </div>
        )}

        <input
          id={inputId}
          className={`
            w-full px-4 py-3
            border rounded-md
            bg-white
            text-gray-900
            placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary-500/20
            transition-all duration-200
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${startAdornment ? "pl-10" : ""}
            ${endAdornment ? "pr-10" : ""}
            ${borderColor}
            ${className}
          `}
          aria-invalid={error}
          aria-describedby={helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {endAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        )}

        {(error || success) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {error && <AlertCircle className="text-error-500" size={20} />}
            {success && (
              <CheckCircle className="text-secondary-500" size={20} />
            )}
          </div>
        )}
      </div>

      {helperText && (
        <p
          id={`${inputId}-helper`}
          className={`mt-1 text-sm ${helperTextColor}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
