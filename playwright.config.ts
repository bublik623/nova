import { type PlaywrightTestConfig, devices } from "@playwright/test";

export const integrationBaseURL = "http://localhost:3001";

const config: PlaywrightTestConfig = {
  testDir: "test/integration",
  timeout: 70000,
  expect: {
    timeout: 10000,
  },
  webServer: process.env.CI
    ? {
        command: "npm run serve",
        url: integrationBaseURL,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
  use: {
    baseURL: integrationBaseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chrome", use: { ...devices["Desktop Chrome"] } }],
  retries: 2,
  reporter: [["list"], ["junit", { outputFile: "integration.xml" }]],
};

export default config;
