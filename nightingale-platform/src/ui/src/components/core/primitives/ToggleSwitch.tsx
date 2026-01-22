"use client";
// import React from "react";

// export interface ToggleSwitchProps extends Omit<
//   React.InputHTMLAttributes<HTMLInputElement>,
//   "type"
// > {
//   label?: string;
//   labelPosition?: "left" | "right";
// }

// export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
//   label,
//   labelPosition = "right",
//   checked,
//   disabled,
//   className = "",
//   id,
//   ...props
// }) => {
//   const generatedId = React.useId();
//   const inputId = id || generatedId;

//   const labelElement = label && (
//     <label
//       htmlFor={inputId}
//       className={`text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700"}`}
//     >
//       {label}
//     </label>
//   );

//   return (
//     <div className={`flex items-center gap-3 ${className}`}>
//       {label && labelPosition === "left" && labelElement}

//       <div className="relative">
//         <input
//           type="checkbox"
//           id={inputId}
//           checked={checked}
//           disabled={disabled}
//           className="sr-only peer"
//           {...props}
//         />

//         {/* Track */}
//         <div
//           className={`
//           w-11 h-6
//           rounded-full
//           peer-checked:bg-primary-500
//           ${disabled ? "bg-gray-300" : "bg-gray-400"}
//           transition-colors duration-200
//           peer-focus:ring-2 peer-focus:ring-primary-500/20
//         `}
//         >
//           {/* Thumb */}
//           <div
//             className={`
//             absolute top-0.5 left-0.5
//             w-5 h-5
//             bg-white
//             rounded-full
//             shadow-sm
//             transition-transform duration-200
//             peer-checked:translate-x-5
//             ${disabled ? "opacity-50" : ""}
//           `}
//           />
//         </div>
//       </div>

//       {label && labelPosition === "right" && labelElement}
//     </div>
//   );
// };

import React, { useId } from "react";

interface ToggleSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelPosition?: "left" | "right";
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  description,
  checked,
  onChange,
  labelPosition = "left",
  disabled = false,
  className = "",
  ...props
}) => {
  const id = useId();

  return (
    <div
      className={`flex items-center justify-between gap-4 py-2 ${className}`}
    >
      {/* Text Content */}
      {labelPosition === "left" && (
        <div className="flex flex-col flex-1">
          <label
            htmlFor={id}
            className={`text-body font-medium ${disabled ? "text-text-low" : "text-text-high"}`}
          >
            {label}
          </label>
          {description && (
            <span className="text-caption text-text-medium leading-tight">
              {description}
            </span>
          )}
        </div>
      )}

      {/* Switch Component */}
      <div className="relative inline-flex items-center group">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />

        {/* Interaction Surface (Ensures 48px touch target) */}
        <div
          className="absolute -inset-2 rounded-full cursor-pointer z-10"
          onClick={() =>
            !disabled && (onChange as any)({ target: { checked: !checked } })
          }
        />

        {/* Track */}
        <div
          className={`
          w-12 h-6 rounded-full transition-colors duration-200
          ${checked ? "bg-primary-500" : "bg-gray-300"}
          peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2
          ${disabled ? "opacity-40 grayscale" : "cursor-pointer"}
        `}
        />

        {/* Thumb */}
        <div
          className={`
          absolute left-1 top-1 bg-surface w-4 h-4 rounded-full transition-transform duration-200
          ${checked ? "translate-x-6" : "translate-x-0"}
          shadow-sm
        `}
        />
      </div>

      {/* Optional Right Label */}
      {labelPosition === "right" && (
        <div className="flex flex-col flex-1">
          <label
            htmlFor={id}
            className={`text-body font-medium ${disabled ? "text-text-low" : "text-text-high"}`}
          >
            {label}
          </label>
          {description && (
            <span className="text-caption text-text-medium">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};
