"use client";
// import React from "react";
// import {
//   Home,
//   Calendar,
//   Stethoscope,
//   DollarSign,
//   User,
//   Settings,
// } from "lucide-react";

// export interface NavigationRailItem {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
//   badge?: number;
//   active?: boolean;
// }

// export interface NavigationRailProps {
//   items?: NavigationRailItem[];
//   activeItem?: string;
//   onChange?: (itemId: string) => void;
//   expanded?: boolean;
// }

// const defaultItems: NavigationRailItem[] = [
//   { id: "home", label: "Dashboard", icon: <Home size={24} /> },
//   { id: "timeline", label: "Timeline", icon: <Calendar size={24} /> },
//   { id: "check-in", label: "Check-In", icon: <Stethoscope size={24} /> },
//   { id: "costs", label: "Costs", icon: <DollarSign size={24} /> },
//   { id: "visits", label: "Visits", icon: <Calendar size={24} /> },
//   { id: "whole-person", label: "Whole Person", icon: <User size={24} /> },
// ];

// export const NavigationRail: React.FC<NavigationRailProps> = ({
//   items = defaultItems,
//   activeItem,
//   onChange,
//   expanded = false,
// }) => {
//   return (
//     <aside
//       className={`
//       fixed left-0 top-0 bottom-0
//       bg-surface border-r border-gray-200
//       flex flex-col
//       transition-all duration-300
//       ${expanded ? "w-64" : "w-20"}
//       z-40
//     `}
//     >
//       {/* Logo/Header */}
//       <div
//         className={`
//         h-16 border-b border-gray-200
//         flex items-center px-4
//         ${expanded ? "justify-start" : "justify-center"}
//       `}
//       >
//         <div className="text-primary-500 font-bold text-xl">
//           {expanded ? "Nightingale" : "N"}
//         </div>
//       </div>

//       {/* Navigation Items */}
//       <nav className="flex-1 py-4 space-y-1">
//         {items.map((item) => {
//           const isActive = activeItem === item.id || item.active;

//           return (
//             <button
//               key={item.id}
//               onClick={() => onChange?.(item.id)}
//               className={`
//                 flex items-center
//                 w-full
//                 py-3 px-4
//                 transition-colors duration-200
//                 ${
//                   isActive
//                     ? "bg-primary-50 text-primary-500 border-r-2 border-primary-500"
//                     : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                 }
//                 ${expanded ? "justify-start gap-3" : "justify-center"}
//               `}
//               aria-label={expanded ? undefined : item.label}
//               title={expanded ? undefined : item.label}
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

//               {expanded && (
//                 <span className="font-medium whitespace-nowrap">
//                   {item.label}
//                 </span>
//               )}
//             </button>
//           );
//         })}
//       </nav>

//       {/* Settings/Fixed Items */}
//       <div className="border-t border-gray-200 py-4">
//         <button
//           className={`
//           flex items-center
//           w-full
//           py-3 px-4
//           text-gray-600 hover:bg-gray-50 hover:text-gray-900
//           transition-colors duration-200
//           ${expanded ? "justify-start gap-3" : "justify-center"}
//         `}
//         >
//           <Settings size={24} />
//           {expanded && <span className="font-medium">Settings</span>}
//         </button>
//       </div>
//     </aside>
//   );
// };

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Clock,
  FileText,
  ClipboardCheck,
  User,
  Settings,
  Plus,
} from "lucide-react";
import { Button } from "../primitives/Button";

/**
 * Nightingale Navigation Rail
 * - Designed for Tablet/Desktop (hidden on mobile).
 * - Features a Floating Action Button (FAB) for primary actions (e.g., 'Add Record').
 * - Aligns icons and labels vertically with MD3 active indicator pills.
 */

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/dashboard" },
  { label: "Timeline", icon: Clock, href: "/timeline" },
  { label: "Records", icon: FileText, href: "/health-record" },
  { label: "Check-in", icon: ClipboardCheck, href: "/check-in" },
];

export const NavigationRail: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col items-center w-[80px] lg:w-[96px] h-screen sticky top-0 bg-surface border-r border-gray-100 py-6 z-50"
      aria-label="Desktop Navigation"
    >
      {/* Top Section: FAB / Primary Action */}
      <div className="mb-8">
        <Button
          variant="primary"
          className="!min-w-0 w-14 h-14 !rounded-2xl shadow-3 flex items-center justify-center"
          aria-label="New Entry"
        >
          <Plus size={28} />
        </Button>
      </div>

      {/* Middle Section: Navigation Links */}
      <div className="flex flex-col gap-4 flex-1 w-full">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full group outline-none py-2"
            >
              {/* MD3 Active Indicator Pill */}
              <div
                className={`
                relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-200
                ${isActive ? "bg-primary-100 text-primary-900" : "text-text-medium group-hover:bg-gray-100"}
              `}
              >
                <Icon size={24} />
              </div>

              {/* Label - Roboto 12px */}
              <span
                className={`
                mt-1 text-[12px] leading-tight transition-colors duration-200
                ${isActive ? "text-text-high font-bold" : "text-text-medium font-medium"}
              `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Section: Secondary Actions */}
      <div className="flex flex-col gap-6 mb-4 w-full">
        <Link
          href="/settings"
          className="flex flex-col items-center text-text-low hover:text-primary-600 transition-colors"
        >
          <Settings size={24} />
          <span className="text-[10px] mt-1">Settings</span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center text-text-low hover:text-primary-600 transition-colors"
        >
          <User size={24} />
          <span className="text-[10px] mt-1">Profile</span>
        </Link>
      </div>
    </aside>
  );
};
