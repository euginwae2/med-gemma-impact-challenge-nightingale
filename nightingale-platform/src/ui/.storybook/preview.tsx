import React from "react";
import { NightingaleThemeProvider } from "../components/design-system/theme/ThemeProvider";
import "./tailwind.css";

export const decorators = [
  (Story) => (
    <NightingaleThemeProvider>
      <div className="p-4">
        <Story />
      </div>
    </NightingaleThemeProvider>
  ),
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
