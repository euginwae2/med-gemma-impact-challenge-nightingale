import React from "react";
import {
  ChevronLeft,
  Bell,
  Menu,
  MoreVertical,
  Search,
  HelpCircle,
} from "lucide-react";
import { Chip } from "../inputs/Chip";

export interface AppBarProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onMenuClick?: () => void;
  notificationCount?: number;
  actions?: React.ReactNode[];
  searchable?: boolean;
  onSearchChange?: (value: string) => void;
}

export const AppBar: React.FC<AppBarProps> = ({
  title,
  showBackButton = false,
  onBack,
  onMenuClick,
  notificationCount = 0,
  actions = [],
  searchable = false,
  onSearchChange,
}) => {
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange?.(value);
  };

  return (
    <header
      className="
      sticky top-0
      bg-surface border-b border-gray-200
      z-30
      safe-area-top
    "
    >
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1">
          {showBackButton ? (
            <button
              onClick={onBack}
              className="
                p-2 -ml-2
                text-gray-600 hover:text-gray-900
                rounded-full hover:bg-gray-100
                transition-colors duration-200
              "
              aria-label="Go back"
            >
              <ChevronLeft size={24} />
            </button>
          ) : onMenuClick ? (
            <button
              onClick={onMenuClick}
              className="
                p-2 -ml-2
                text-gray-600 hover:text-gray-900
                rounded-full hover:bg-gray-100
                transition-colors duration-200
              "
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          ) : null}

          {!isSearching ? (
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {title}
            </h1>
          ) : (
            <div className="flex-1">
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="
                  w-full px-4 py-2
                  bg-gray-100
                  rounded-lg
                  border-0
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                "
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {searchable && !isSearching && (
            <button
              onClick={() => setIsSearching(true)}
              className="
                p-2
                text-gray-600 hover:text-gray-900
                rounded-full hover:bg-gray-100
                transition-colors duration-200
              "
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          )}

          {isSearching && (
            <button
              onClick={() => {
                setIsSearching(false);
                setSearchValue("");
                onSearchChange?.("");
              }}
              className="
                p-2
                text-gray-600 hover:text-gray-900
                rounded-full hover:bg-gray-100
                transition-colors duration-200
              "
              aria-label="Cancel search"
            >
              Cancel
            </button>
          )}

          <button
            className="
              p-2
              text-gray-600 hover:text-gray-900
              rounded-full hover:bg-gray-100
              transition-colors duration-200
            "
            aria-label="Help"
          >
            <HelpCircle size={20} />
          </button>

          <div className="relative">
            <button
              className="
                p-2
                text-gray-600 hover:text-gray-900
                rounded-full hover:bg-gray-100
                transition-colors duration-200
              "
              aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} unread)` : ""}`}
            >
              <Bell size={20} />
            </button>

            {notificationCount > 0 && (
              <span
                className="
                absolute top-1 right-1
                min-w-5 h-5
                flex items-center justify-center
                bg-error-500 text-white text-xs font-bold
                rounded-full
                px-1
              "
              >
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </div>

          <button
            className="
              p-2
              text-gray-600 hover:text-gray-900
              rounded-full hover:bg-gray-100
              transition-colors duration-200
            "
            aria-label="More options"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
