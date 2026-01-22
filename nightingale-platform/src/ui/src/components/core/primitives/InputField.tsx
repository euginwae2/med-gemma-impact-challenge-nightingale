"use client";
// import React from "react";
// import { AlertCircle, CheckCircle } from "lucide-react";
// import { useDesignTokens } from "../../design-system/theme/ThemeProvider";

// export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   label?: string;
//   helperText?: string;
//   error?: boolean;
//   success?: boolean;
//   fullWidth?: boolean;
//   startAdornment?: React.ReactNode;
//   endAdornment?: React.ReactNode;
// }

// export const InputField: React.FC<InputFieldProps> = ({
//   label,
//   helperText,
//   error = false,
//   success = false,
//   fullWidth = false,
//   startAdornment,
//   endAdornment,
//   id,
//   className = "",
//   ...props
// }) => {
//   const tokens = useDesignTokens();

//   const generatedId = React.useId();
//   const inputId = id || generatedId;

//   const borderColor = error
//     ? "border-error-500 focus:border-error-500"
//     : success
//       ? "border-secondary-500 focus:border-secondary-500"
//       : "border-gray-300 focus:border-primary-500";

//   const helperTextColor = error
//     ? "text-error-500"
//     : success
//       ? "text-secondary-500"
//       : "text-gray-600";

//   return (
//     <div className={fullWidth ? "w-full" : ""}>
//       {label && (
//         <label
//           htmlFor={inputId}
//           className="block text-sm font-medium text-gray-700 mb-1"
//         >
//           {label}
//         </label>
//       )}

//       <div className="relative">
//         {startAdornment && (
//           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
//             {startAdornment}
//           </div>
//         )}

//         <input
//           id={inputId}
//           className={`
//             w-full px-4 py-3
//             border rounded-md
//             bg-white
//             text-gray-900
//             placeholder:text-gray-500
//             focus:outline-none focus:ring-2 focus:ring-primary-500/20
//             transition-all duration-200
//             disabled:bg-gray-100 disabled:cursor-not-allowed
//             ${startAdornment ? "pl-10" : ""}
//             ${endAdornment ? "pr-10" : ""}
//             ${borderColor}
//             ${className}
//           `}
//           aria-invalid={error}
//           aria-describedby={helperText ? `${inputId}-helper` : undefined}
//           {...props}
//         />

//         {endAdornment && (
//           <div className="absolute right-3 top-1/2 -translate-y-1/2">
//             {endAdornment}
//           </div>
//         )}

//         {(error || success) && (
//           <div className="absolute right-3 top-1/2 -translate-y-1/2">
//             {error && <AlertCircle className="text-error-500" size={20} />}
//             {success && (
//               <CheckCircle className="text-secondary-500" size={20} />
//             )}
//           </div>
//         )}
//       </div>

//       {helperText && (
//         <p
//           id={`${inputId}-helper`}
//           className={`mt-1 text-sm ${helperTextColor}`}
//         >
//           {helperText}
//         </p>
//       )}
//     </div>
//   );
// };

import React, { useId } from "react";
import { LucideIcon, AlertCircle, CheckCircle2 } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  fullWidth?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  helperText,
  error,
  success,
  startIcon: StartIcon,
  endIcon: EndIcon,
  fullWidth = true,
  className = "",
  disabled,
  required,
  ...props
}) => {
  // Use React 19.2 useId for accessible label-input pairing
  const generatedId = useId();
  const inputId = props.id || generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  // Base container styles
  const containerClasses = `${fullWidth ? "w-full" : "w-auto"} flex flex-col gap-1.5`;

  // Input wrapper for icon positioning
  const wrapperClasses = `
    relative flex items-center transition-all duration-200
    bg-surface rounded-md border-2
    ${disabled ? "bg-gray-50 border-gray-200 opacity-60" : ""}
    ${error ? "border-error-500" : success ? "border-secondary-500" : "border-gray-200 focus-within:border-primary-500"}
  `;

  // Inner input styles (Ensuring 48px height)
  const inputClasses = `
    w-full h-[48px] px-md py-sm
    text-body text-text-high bg-transparent
    placeholder:text-text-low focus:outline-none
    ${StartIcon ? "pl-11" : ""}
    ${EndIcon || error || success ? "pr-11" : ""}
  `;

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* Label - High Emphasis for Clinical Clarity */}
      <label
        htmlFor={inputId}
        className="text-label font-semibold text-text-high flex items-center gap-1"
      >
        {label}
        {required && (
          <span className="text-error-500" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className={wrapperClasses}>
        {/* Leading Icon (e.g., Search, Calendar) */}
        {StartIcon && (
          <div className="absolute left-3 text-text-low pointer-events-none">
            <StartIcon size={20} />
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={`${helperText ? helperId : ""} ${error ? errorId : ""}`}
          className={inputClasses}
          {...props}
        />

        {/* Trailing Feedback Icons */}
        <div className="absolute right-3 flex items-center gap-1">
          {error && <AlertCircle size={20} className="text-error-500" />}
          {!error && success && (
            <CheckCircle2 size={20} className="text-secondary-500" />
          )}
          {!error && !success && EndIcon && (
            <EndIcon size={20} className="text-text-low" />
          )}
        </div>
      </div>

      {/* Helper & Error Messaging */}
      {error ? (
        <p
          id={errorId}
          className="text-caption text-error-500 font-medium"
          role="alert"
        >
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-caption text-text-medium">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
