import React from "react";

export interface ToggleSwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  labelPosition?: "left" | "right";
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  labelPosition = "right",
  checked,
  disabled,
  className = "",
  id,
  ...props
}) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  const labelElement = label && (
    <label
      htmlFor={inputId}
      className={`text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700"}`}
    >
      {label}
    </label>
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {label && labelPosition === "left" && labelElement}

      <div className="relative">
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />

        {/* Track */}
        <div
          className={`
          w-11 h-6
          rounded-full
          peer-checked:bg-primary-500
          ${disabled ? "bg-gray-300" : "bg-gray-400"}
          transition-colors duration-200
          peer-focus:ring-2 peer-focus:ring-primary-500/20
        `}
        >
          {/* Thumb */}
          <div
            className={`
            absolute top-0.5 left-0.5
            w-5 h-5
            bg-white
            rounded-full
            shadow-sm
            transition-transform duration-200
            peer-checked:translate-x-5
            ${disabled ? "opacity-50" : ""}
          `}
          />
        </div>
      </div>

      {label && labelPosition === "right" && labelElement}
    </div>
  );
};
