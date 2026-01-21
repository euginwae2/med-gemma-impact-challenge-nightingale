import React from "react";
import {
  Home,
  Calendar,
  Stethoscope,
  DollarSign,
  User,
  Clock,
  MapPin,
} from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  active?: boolean;
}

export interface BottomNavigationBarProps {
  items?: NavigationItem[];
  activeItem?: string;
  onChange?: (itemId: string) => void;
}

const defaultItems: NavigationItem[] = [
  { id: "timeline", label: "Timeline", icon: <Clock size={24} /> },
  { id: "check-in", label: "Check-In", icon: <Stethoscope size={24} /> },
  { id: "costs", label: "Costs", icon: <DollarSign size={24} /> },
  { id: "visits", label: "Visits", icon: <Calendar size={24} /> },
  { id: "whole-person", label: "Whole Person", icon: <User size={24} /> },
];

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  items = defaultItems,
  activeItem,
  onChange,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const isActive = activeItem === item.id || item.active;

          return (
            <button
              key={item.id}
              onClick={() => onChange?.(item.id)}
              className={`
                flex flex-col items-center justify-center
                relative
                min-w-16
                p-2
                transition-colors duration-200
                ${isActive ? "text-primary-500" : "text-gray-500 hover:text-gray-700"}
              `}
              aria-label={item.label}
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

              <span
                className={`
                text-xs mt-1 font-medium
                ${isActive ? "text-primary-500" : "text-gray-600"}
              `}
              >
                {item.label}
              </span>

              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-500 rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
