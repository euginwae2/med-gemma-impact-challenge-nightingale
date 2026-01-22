// Design Token Constants
export const DESIGN_TOKENS = {
  // Color Palette (Material Design 3)
  colors: {
    primary: {
      50: "#E8F0FE",
      100: "#D2E3FC",
      200: "#AECBFA",
      300: "#8AB4F8",
      400: "#669DF6",
      500: "#1A73E8", // Primary
      600: "#0D62C9",
      700: "#0B53A8",
      800: "#094587",
      900: "#073667",
    },
    secondary: {
      50: "#E6F4EA",
      100: "#CEEAD6",
      200: "#A7D7B8",
      300: "#80C39A",
      400: "#59B07C",
      500: "#34A853", // Secondary
      600: "#2E8B47",
      700: "#28743B",
      800: "#225D2F",
      900: "#1C4623",
    },
    error: {
      50: "#FCE8E6",
      100: "#FAD2CF",
      200: "#F6A69F",
      300: "#F2796F",
      400: "#EE4D3F",
      500: "#EA4335", // Error
      600: "#D23A2E",
      700: "#BA3127",
      800: "#A12820",
      900: "#891F19",
    },
    warning: {
      50: "#FEF7E0",
      100: "#FEF0C7",
      200: "#FEE2A0",
      300: "#FDD379",
      400: "#FDC552",
      500: "#FBBC04", // Warning
      600: "#E2A903",
      700: "#C89603",
      800: "#AF8302",
      900: "#967002",
    },
    surface: "#FFFFFF",
    background: "#F8F9FA",
    text: {
      highEmphasis: "#202124",
      mediumEmphasis: "#5F6368",
      disabled: "#9AA0A6",
      onPrimary: "#FFFFFF",
      onSecondary: "#FFFFFF",
      onError: "#FFFFFF",
    },
  },

  // Typography
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
    fontSizes: {
      h1: "32px",
      h2: "24px",
      h3: "20px",
      body: "16px",
      label: "14px",
      caption: "12px",
    },
    lineHeights: {
      h1: "40px",
      h2: "32px",
      h3: "28px",
      body: "24px",
      label: "20px",
      caption: "16px",
    },
  },

  // Spacing (8px grid system)
  spacing: {
    unit: 8,
    xs: "4px", // 0.5 * unit
    sm: "8px", // 1 * unit
    md: "16px", // 2 * unit
    lg: "24px", // 3 * unit
    xl: "32px", // 4 * unit
    xxl: "48px", // 6 * unit
  },

  // Border Radius
  borderRadius: {
    none: "0px",
    xs: "4px",
    sm: "8px",
    md: "12px", // For cards
    lg: "16px",
    xl: "20px", // For buttons
    round: "50%",
  },

  // Elevation (Shadow system)
  elevation: {
    0: "none",
    1: "0px 1px 2px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.1)",
    2: "0px 2px 4px rgba(0, 0, 0, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.1)",
    3: "0px 4px 8px rgba(0, 0, 0, 0.12), 0px 6px 12px rgba(0, 0, 0, 0.12)",
    4: "0px 8px 16px rgba(0, 0, 0, 0.14), 0px 12px 24px rgba(0, 0, 0, 0.14)",
    5: "0px 16px 32px rgba(0, 0, 0, 0.16), 0px 24px 48px rgba(0, 0, 0, 0.16)",
  },

  // Animation
  animation: {
    duration: {
      short: "150ms",
      medium: "250ms",
      long: "350ms",
    },
    easing: {
      standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      decelerate: "cubic-bezier(0, 0, 0.2, 1)",
      accelerate: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },
} as const;

// TypeScript utility types
export type ColorToken = keyof typeof DESIGN_TOKENS.colors;
export type SpacingToken = keyof typeof DESIGN_TOKENS.spacing;
export type ElevationToken = keyof typeof DESIGN_TOKENS.elevation;
