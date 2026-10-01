import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 15_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "off"
  },
  webServer: {
    command: "python3 -m http.server 4173",
    port: 4173,
    reuseExistingServer: !process.env.CI
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
