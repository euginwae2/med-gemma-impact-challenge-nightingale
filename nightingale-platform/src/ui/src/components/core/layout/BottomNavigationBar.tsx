"use client";
// import React from "react";
// import {
//   Home,
//   Calendar,
//   Stethoscope,
//   DollarSign,
//   User,
//   Clock,
//   MapPin,
// } from "lucide-react";

// export interface NavigationItem {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
//   badge?: number;
//   active?: boolean;
// }

// export interface BottomNavigationBarProps {
//   items?: NavigationItem[];
//   activeItem?: string;
//   onChange?: (itemId: string) => void;
// }

// const defaultItems: NavigationItem[] = [
//   { id: "timeline", label: "Timeline", icon: <Clock size={24} /> },
//   { id: "check-in", label: "Check-In", icon: <Stethoscope size={24} /> },
//   { id: "costs", label: "Costs", icon: <DollarSign size={24} /> },
//   { id: "visits", label: "Visits", icon: <Calendar size={24} /> },
//   { id: "whole-person", label: "Whole Person", icon: <User size={24} /> },
// ];

// export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
//   items = defaultItems,
//   activeItem,
//   onChange,
// }) => {
//   return (
//     <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 safe-area-bottom">
//       <div className="flex justify-around items-center h-16 px-2">
//         {items.map((item) => {
//           const isActive = activeItem === item.id || item.active;

//           return (
//             <button
//               key={item.id}
//               onClick={() => onChange?.(item.id)}
//               className={`
//                 flex flex-col items-center justify-center
//                 relative
//                 min-w-16
//                 p-2
//                 transition-colors duration-200
//                 ${isActive ? "text-primary-500" : "text-gray-500 hover:text-gray-700"}
//               `}
//               aria-label={item.label}
//               aria-current={isActive ? "page" : undefined}
//             >
//               <div className="relative">
//                 {item.icon}
//                 {item.badge && item.badge > 0 && (
//                   <span
//                     className="
//                     absolute -top-1 -right-1
//                     min-w-5 h-5
//                     flex items-center justify-center
//                     bg-error-500 text-white text-xs font-bold
//                     rounded-full
//                     px-1
//                   "
//                   >
//                     {item.badge > 99 ? "99+" : item.badge}
//                   </span>
//                 )}
//               </div>

//               <span
//                 className={`
//                 text-xs mt-1 font-medium
//                 ${isActive ? "text-primary-500" : "text-gray-600"}
//               `}
//               >
//                 {item.label}
//               </span>

//               {isActive && (
//                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-500 rounded-b-full" />
//               )}
//             </button>
//           );
//         })}
//       </div>
//     </nav>
//   );
// };

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, FileText, ClipboardCheck, User } from "lucide-react";

/**
 * Nightingale Bottom Navigation
 * - Fixed to the bottom of the viewport.
 * - Implements 48px touch targets for each tab.
 * - Active state uses Primary-50 background for the "Pill" indicator (MD3).
 */

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/dashboard" },
  { label: "Timeline", icon: Clock, href: "/timeline" },
  { label: "Records", icon: FileText, href: "/health-record" },
  { label: "Check-in", icon: ClipboardCheck, href: "/check-in" },
  { label: "Profile", icon: User, href: "/profile" },
];

export const BottomNavigationBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-[80px] bg-surface border-t border-gray-100 flex items-center justify-around px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden"
      aria-label="Main Navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center flex-1 min-w-[64px] h-full group outline-none"
          >
            {/* MD3 Active Indicator Pill */}
            <div
              className={`
              relative flex items-center justify-center w-16 h-8 rounded-full transition-all duration-200
              ${isActive ? "bg-primary-50 text-primary-600" : "text-text-medium group-hover:bg-gray-50"}
            `}
            >
              <Icon
                size={24}
                className={isActive ? "stroke-[2.5px]" : "stroke-[2px]"}
              />

              {/* Optional: Active Dot for subtle visual cue */}
              {isActive && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
              )}
            </div>

            {/* Label - Roboto 12px (Caption) */}
            <span
              className={`
              mt-1 text-caption transition-colors duration-200
              ${isActive ? "text-text-high font-bold" : "text-text-medium font-medium"}
            `}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
