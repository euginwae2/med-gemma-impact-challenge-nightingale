import React, { createContext, useContext } from "react";
import { ThemeProvider as MUIThemeProvider, createTheme } from "@mui/material";
import { DESIGN_TOKENS } from "./tokens";

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: DESIGN_TOKENS.colors.primary[500],
      light: DESIGN_TOKENS.colors.primary[300],
      dark: DESIGN_TOKENS.colors.primary[700],
    },
    secondary: {
      main: DESIGN_TOKENS.colors.secondary[500],
      light: DESIGN_TOKENS.colors.secondary[300],
      dark: DESIGN_TOKENS.colors.secondary[700],
    },
    error: {
      main: DESIGN_TOKENS.colors.error[500],
    },
    warning: {
      main: DESIGN_TOKENS.colors.warning[500],
    },
    background: {
      default: DESIGN_TOKENS.colors.background,
      paper: DESIGN_TOKENS.colors.surface,
    },
    text: {
      primary: DESIGN_TOKENS.colors.text.highEmphasis,
      secondary: DESIGN_TOKENS.colors.text.mediumEmphasis,
      disabled: DESIGN_TOKENS.colors.text.disabled,
    },
  },
  typography: {
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    h1: {
      fontSize: DESIGN_TOKENS.typography.fontSizes.h1,
      fontWeight: DESIGN_TOKENS.typography.fontWeights.bold,
      lineHeight: DESIGN_TOKENS.typography.lineHeights.h1,
    },
    h2: {
      fontSize: DESIGN_TOKENS.typography.fontSizes.h2,
      fontWeight: DESIGN_TOKENS.typography.fontWeights.bold,
      lineHeight: DESIGN_TOKENS.typography.lineHeights.h2,
    },
    h3: {
      fontSize: DESIGN_TOKENS.typography.fontSizes.h3,
      fontWeight: DESIGN_TOKENS.typography.fontWeights.bold,
      lineHeight: DESIGN_TOKENS.typography.lineHeights.h3,
    },
    body1: {
      fontSize: DESIGN_TOKENS.typography.fontSizes.body,
      fontWeight: DESIGN_TOKENS.typography.fontWeights.regular,
      lineHeight: DESIGN_TOKENS.typography.lineHeights.body,
    },
    button: {
      fontSize: DESIGN_TOKENS.typography.fontSizes.label,
      fontWeight: DESIGN_TOKENS.typography.fontWeights.medium,
      textTransform: "none" as const,
    },
  },
  shape: {
    borderRadius: parseInt(DESIGN_TOKENS.borderRadius.md),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: DESIGN_TOKENS.borderRadius.xl,
          minHeight: "48px",
          padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.lg}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: DESIGN_TOKENS.borderRadius.md,
          boxShadow: DESIGN_TOKENS.elevation[1],
        },
      },
    },
  },
});

// Design Token Context
const DesignTokenContext = createContext(DESIGN_TOKENS);

export const useDesignTokens = () => useContext(DesignTokenContext);

export const NightingaleThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <DesignTokenContext.Provider value={DESIGN_TOKENS}>
      <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
    </DesignTokenContext.Provider>
  );
};
