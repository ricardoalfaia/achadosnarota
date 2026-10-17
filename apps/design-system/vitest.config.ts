import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Cada história roda como teste em Chromium: renderiza sem erro e passa no axe.
export default defineConfig({
  plugins: [tailwindcss(), storybookTest({ configDir: ".storybook" })],
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
