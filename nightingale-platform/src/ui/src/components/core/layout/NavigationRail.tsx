import React from "react";
import {
  Home,
  Calendar,
  Stethoscope,
  DollarSign,
  User,
  Settings,
} from "lucide-react";

export interface NavigationRailItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  active?: boolean;
}

export interface NavigationRailProps {
  items?: NavigationRailItem[];
  activeItem?: string;
  onChange?: (itemId: string) => void;
  expanded?: boolean;
}

const defaultItems: NavigationRailItem[] = [
  { id: "home", label: "Dashboard", icon: <Home size={24} /> },
  { id: "timeline", label: "Timeline", icon: <Calendar size={24} /> },
  { id: "check-in", label: "Check-In", icon: <Stethoscope size={24} /> },
  { id: "costs", label: "Costs", icon: <DollarSign size={24} /> },
  { id: "visits", label: "Visits", icon: <Calendar size={24} /> },
  { id: "whole-person", label: "Whole Person", icon: <User size={24} /> },
];

export const NavigationRail: React.FC<NavigationRailProps> = ({
  items = defaultItems,
  activeItem,
  onChange,
  expanded = false,
}) => {
  return (
    <aside
      className={`
      fixed left-0 top-0 bottom-0
      bg-surface border-r border-gray-200
      flex flex-col
      transition-all duration-300
      ${expanded ? "w-64" : "w-20"}
      z-40
    `}
    >
      {/* Logo/Header */}
      <div
        className={`
        h-16 border-b border-gray-200
        flex items-center px-4
        ${expanded ? "justify-start" : "justify-center"}
      `}
      >
        <div className="text-primary-500 font-bold text-xl">
          {expanded ? "Nightingale" : "N"}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 space-y-1">
        {items.map((item) => {
          const isActive = activeItem === item.id || item.active;

          return (
            <button
              key={item.id}
              onClick={() => onChange?.(item.id)}
              className={`
                flex items-center
                w-full
                py-3 px-4
                transition-colors duration-200
                ${
                  isActive
                    ? "bg-primary-50 text-primary-500 border-r-2 border-primary-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
                ${expanded ? "justify-start gap-3" : "justify-center"}
              `}
              aria-label={expanded ? undefined : item.label}
              title={expanded ? undefined : item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span
                    className="
                    absolute -top-1 -right-1
                    min-w-5 h-5
                    flex items-center justify-center
                    bg-error-500 text-white text-xs font-bold
                    rounded-full
                    px-1
                  "
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              {expanded && (
                <span className="font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings/Fixed Items */}
      <div className="border-t border-gray-200 py-4">
        <button
          className={`
          flex items-center
          w-full
          py-3 px-4
          text-gray-600 hover:bg-gray-50 hover:text-gray-900
          transition-colors duration-200
          ${expanded ? "justify-start gap-3" : "justify-center"}
        `}
        >
          <Settings size={24} />
          {expanded && <span className="font-medium">Settings</span>}
        </button>
      </div>
    </aside>
  );
};
