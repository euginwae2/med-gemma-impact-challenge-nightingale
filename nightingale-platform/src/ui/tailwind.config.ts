// tailwind.config.ts
import type { Config } from "tailwindcss";

// If your files are inside a 'src' folder (as suggested by your error logs),
// you may need to add 'src/' to the path:
// import { DESIGN_TOKENS } from "./src/components/design-system/theme/tokens";

// Otherwise, if they are at the root as per your tree:
import { DESIGN_TOKENS } from "./components/design-system/theme/tokens";

const config: Config = {
  content: [
    // Ensure these paths match where your files actually live.
    // If you have a 'src' folder, use "./src/**/*.{js,ts,jsx,tsx,mdx}"
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        primary: DESIGN_TOKENS.colors.primary,
        secondary: DESIGN_TOKENS.colors.secondary,
        error: DESIGN_TOKENS.colors.error,
        warning: DESIGN_TOKENS.colors.warning,
        surface: DESIGN_TOKENS.colors.surface,
        background: DESIGN_TOKENS.colors.background,
        text: DESIGN_TOKENS.colors.text,
      },
      spacing: DESIGN_TOKENS.spacing,
      borderRadius: DESIGN_TOKENS.borderRadius,
      fontFamily: {
        sans: [DESIGN_TOKENS.typography.fontFamily],
      },
      fontSize: DESIGN_TOKENS.typography.fontSizes,
      boxShadow: DESIGN_TOKENS.elevation,
    },
  },
  plugins: [],
};

export default config;
