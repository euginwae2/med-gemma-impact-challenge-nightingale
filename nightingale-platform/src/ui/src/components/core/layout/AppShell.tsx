"use client";
import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { SideNavigationRail } from "./SideNavigationRail";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "white" }}>
      {/* Desktop Navigation */}
      {isDesktop && <SideNavigationRail />}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 4, width: { md: `calc(100% - 280px)` } }}
      >
        <div className="max-w-6xl mx-auto">{children}</div>
      </Box>

      {/* TODO: Add Mobile Bottom Navigation here for < md screens */}
    </Box>
  );
}
