"use client";
// import React from "react";
// import {
//   ChevronLeft,
//   Bell,
//   Menu,
//   MoreVertical,
//   Search,
//   HelpCircle,
// } from "lucide-react";
// import { Chip } from "../inputs/Chip";

// export interface AppBarProps {
//   title: string;
//   showBackButton?: boolean;
//   onBack?: () => void;
//   onMenuClick?: () => void;
//   notificationCount?: number;
//   actions?: React.ReactNode[];
//   searchable?: boolean;
//   onSearchChange?: (value: string) => void;
// }

// export const AppBar: React.FC<AppBarProps> = ({
//   title,
//   showBackButton = false,
//   onBack,
//   onMenuClick,
//   notificationCount = 0,
//   actions = [],
//   searchable = false,
//   onSearchChange,
// }) => {
//   const [isSearching, setIsSearching] = React.useState(false);
//   const [searchValue, setSearchValue] = React.useState("");

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setSearchValue(value);
//     onSearchChange?.(value);
//   };

//   return (
//     <header
//       className="
//       sticky top-0
//       bg-surface border-b border-gray-200
//       z-30
//       safe-area-top
//     "
//     >
//       <div className="h-16 px-4 flex items-center justify-between">
//         {/* Left Section */}
//         <div className="flex items-center gap-3 flex-1">
//           {showBackButton ? (
//             <button
//               onClick={onBack}
//               className="
//                 p-2 -ml-2
//                 text-gray-600 hover:text-gray-900
//                 rounded-full hover:bg-gray-100
//                 transition-colors duration-200
//               "
//               aria-label="Go back"
//             >
//               <ChevronLeft size={24} />
//             </button>
//           ) : onMenuClick ? (
//             <button
//               onClick={onMenuClick}
//               className="
//                 p-2 -ml-2
//                 text-gray-600 hover:text-gray-900
//                 rounded-full hover:bg-gray-100
//                 transition-colors duration-200
//               "
//               aria-label="Open menu"
//             >
//               <Menu size={24} />
//             </button>
//           ) : null}

//           {!isSearching ? (
//             <h1 className="text-xl font-bold text-gray-900 truncate">
//               {title}
//             </h1>
//           ) : (
//             <div className="flex-1">
//               <input
//                 type="text"
//                 value={searchValue}
//                 onChange={handleSearchChange}
//                 placeholder="Search..."
//                 className="
//                   w-full px-4 py-2
//                   bg-gray-100
//                   rounded-lg
//                   border-0
//                   focus:outline-none focus:ring-2 focus:ring-primary-500/20
//                 "
//                 autoFocus
//               />
//             </div>
//           )}
//         </div>

//         {/* Right Section - Actions */}
//         <div className="flex items-center gap-2">
//           {searchable && !isSearching && (
//             <button
//               onClick={() => setIsSearching(true)}
//               className="
//                 p-2
//                 text-gray-600 hover:text-gray-900
//                 rounded-full hover:bg-gray-100
//                 transition-colors duration-200
//               "
//               aria-label="Search"
//             >
//               <Search size={20} />
//             </button>
//           )}

//           {isSearching && (
//             <button
//               onClick={() => {
//                 setIsSearching(false);
//                 setSearchValue("");
//                 onSearchChange?.("");
//               }}
//               className="
//                 p-2
//                 text-gray-600 hover:text-gray-900
//                 rounded-full hover:bg-gray-100
//                 transition-colors duration-200
//               "
//               aria-label="Cancel search"
//             >
//               Cancel
//             </button>
//           )}

//           <button
//             className="
//               p-2
//               text-gray-600 hover:text-gray-900
//               rounded-full hover:bg-gray-100
//               transition-colors duration-200
//             "
//             aria-label="Help"
//           >
//             <HelpCircle size={20} />
//           </button>

//           <div className="relative">
//             <button
//               className="
//                 p-2
//                 text-gray-600 hover:text-gray-900
//                 rounded-full hover:bg-gray-100
//                 transition-colors duration-200
//               "
//               aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} unread)` : ""}`}
//             >
//               <Bell size={20} />
//             </button>

//             {notificationCount > 0 && (
//               <span
//                 className="
//                 absolute top-1 right-1
//                 min-w-5 h-5
//                 flex items-center justify-center
//                 bg-error-500 text-white text-xs font-bold
//                 rounded-full
//                 px-1
//               "
//               >
//                 {notificationCount > 99 ? "99+" : notificationCount}
//               </span>
//             )}
//           </div>

//           <button
//             className="
//               p-2
//               text-gray-600 hover:text-gray-900
//               rounded-full hover:bg-gray-100
//               transition-colors duration-200
//             "
//             aria-label="More options"
//           >
//             <MoreVertical size={20} />
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Bell, LifeBuoy, UserCircle } from "lucide-react";
import { Button } from "../primitives/Button";

interface AppBarProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const AppBar: React.FC<AppBarProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  actions,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-md border-b border-gray-100">
      <div className="h-[64px] px-md flex items-center justify-between gap-4">
        {/* Left Section: Navigation & Identity */}
        <div className="flex items-center gap-2 overflow-hidden">
          {showBackButton && (
            <Button
              variant="tertiary"
              onClick={handleBack}
              className="!min-w-0 !p-2 -ml-2 h-10 w-10"
              aria-label="Go back"
            >
              <ChevronLeft size={24} className="text-text-high" />
            </Button>
          )}

          <div className="flex flex-col truncate">
            <h1 className="text-h3 font-bold text-text-high truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <span className="text-caption text-text-medium truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Universal Actions */}
        <div className="flex items-center gap-1">
          {actions ? (
            actions
          ) : (
            <>
              {/* Search Toggle */}
              <Button
                variant="tertiary"
                className="!min-w-0 h-11 w-11"
                aria-label="Search records"
              >
                <Search size={20} className="text-text-medium" />
              </Button>

              {/* Emergency/Support - High Visibility for Stress Scenarios */}
              <Button
                variant="tertiary"
                className="!min-w-0 h-11 w-11 text-error-500"
                aria-label="Get help"
              >
                <LifeBuoy size={20} />
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="tertiary"
                  className="!min-w-0 h-11 w-11"
                  aria-label="Notifications"
                >
                  <Bell size={20} className="text-text-medium" />
                </Button>
                {/* Notification Badge */}
                <span className="absolute top-2 right-2 w-2 h-2 bg-error-500 rounded-full border-2 border-surface" />
              </div>

              {/* Profile - Tablet/Desktop only (Mobile uses BottomNav) */}
              <div className="hidden sm:block ml-2">
                <Button
                  variant="tertiary"
                  className="!min-w-0 p-0 h-10 w-10 rounded-full overflow-hidden border border-gray-200"
                >
                  <UserCircle size={32} className="text-gray-400" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
