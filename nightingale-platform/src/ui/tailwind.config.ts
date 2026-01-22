import type { Config } from "tailwindcss";
/** * RESOLUTION FIX: We use the explicit path to the index file.
 * Ensure your tsconfig.json includes "tailwind.config.ts" in the 'include' array.
 */
import { DESIGN_TOKENS } from "./src/design-tokens/index";

const config: Config = {
  // Scan all files in the Nightingale src directory
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/design-tokens/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // We extend the theme to preserve Tailwind's default utility classes
    // while layering the Nightingale specific tokens on top.
    extend: {
      colors: {
        // Semantic mapping for Nightingale UI
        primary: DESIGN_TOKENS.colors.primary,
        secondary: DESIGN_TOKENS.colors.secondary,
        error: DESIGN_TOKENS.colors.error,
        warning: DESIGN_TOKENS.colors.warning,
        surface: DESIGN_TOKENS.colors.surface,
        background: DESIGN_TOKENS.colors.background,
        text: DESIGN_TOKENS.colors.text,
      },
      spacing: {
        // 8px grid system implementation
        xs: DESIGN_TOKENS.spacing.xs,
        sm: DESIGN_TOKENS.spacing.sm,
        md: DESIGN_TOKENS.spacing.md,
        lg: DESIGN_TOKENS.spacing.lg,
        xl: DESIGN_TOKENS.spacing.xl,
        xxl: DESIGN_TOKENS.spacing.xxl,
      },
      borderRadius: {
        // Material Design 3 radii specs
        md: DESIGN_TOKENS.borderRadius.md, // 12px for cards
        xl: DESIGN_TOKENS.borderRadius.xl, // 20px for buttons
      },
      boxShadow: {
        // MD3 Elevation levels mapped from DESIGN_TOKENS
        1: DESIGN_TOKENS.elevation[1],
        2: DESIGN_TOKENS.elevation[2],
        3: DESIGN_TOKENS.elevation[3],
      },
      fontFamily: {
        // Unified typography foundation using Roboto
        sans: [
          DESIGN_TOKENS.typography.fontFamily,
          "ui-sans-serif",
          "system-ui",
        ],
      },
      fontSize: {
        // Custom Nightingale type scale
        h1: DESIGN_TOKENS.typography.fontSizes.h1,
        h2: DESIGN_TOKENS.typography.fontSizes.h2,
        h3: DESIGN_TOKENS.typography.fontSizes.h3,
        body: DESIGN_TOKENS.typography.fontSizes.body,
        label: DESIGN_TOKENS.typography.fontSizes.label,
        caption: DESIGN_TOKENS.typography.fontSizes.caption,
      },
    },
  },
  // Ensure no conflicting default colors are purged if they are needed for legacy
  plugins: [],
} satisfies Config;

export default config;
