"use client";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import {
  LayoutDashboard,
  Activity,
  FileText,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Timeline", icon: Activity, path: "/timeline" },
  { label: "Records", icon: FileText, path: "/health-record" },
  { label: "Check-In", icon: ClipboardList, path: "/check-in" },
];

const DRAWER_WIDTH = 280;

export function SideNavigationRail() {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          borderRight: "1px solid #E2E8F0", // slate-200
          backgroundColor: "#F8FAFC", // slate-50
        },
      }}
    >
      <Toolbar>
        <div className="text-xl font-bold text-primary-600 px-2">
          Nightingale
        </div>
      </Toolbar>

      <List sx={{ px: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={isActive}
                sx={{
                  borderRadius: "12px",
                  "&.Mui-selected": {
                    bgcolor: "#EFF6FF", // primary-50
                    color: "#2563EB", // primary-600
                    "&:hover": { bgcolor: "#DBEAFE" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 40, color: isActive ? "#2563EB" : "#64748B" }}
                >
                  <item.icon size={22} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
