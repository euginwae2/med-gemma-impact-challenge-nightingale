"use client"; // Required for Context Providers in App Router

import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { store } from "@/app/store"; // Ensure path is correct
import { DESIGN_TOKENS } from "@/design-tokens";

const muiTheme = createTheme({
  palette: {
    primary: { main: DESIGN_TOKENS.colors.primary[500] },
    secondary: { main: DESIGN_TOKENS.colors.secondary[500] },
    error: { main: DESIGN_TOKENS.colors.error[500] },
  },
  shape: { borderRadius: 12 },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ReduxProvider>
  );
}
