import { defineConfig, devices } from "@playwright/test"
import { loadE2eEnvSync, toSpawnEnv } from "./scripts/shared/e2eEnv"

const e2eEnv = loadE2eEnvSync()

const baseURL = e2eEnv.VITE_APP_ORIGIN
const runAllBrowsers = process.env.E2E_ALL_BROWSERS === "1"

/** Local parallel workers. Lower (e.g. 2) if the dev server flakes under load. */
const localWorkers = 2

/** CI stays single-worker for deterministic smoke runs. */
const ciWorkers = 1

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  globalSetup: require.resolve("./playwright.global-setup"),
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? ciWorkers : localWorkers,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? "github" : [["list"], ["html"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: "chromium",
      dependencies: ["setup"],
      testIgnore: /.*\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    ...(runAllBrowsers
      ? [
          {
            name: "firefox",
            dependencies: ["setup"],
            testIgnore: /.*\.setup\.ts/,
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "webkit",
            dependencies: ["setup"],
            testIgnore: /.*\.setup\.ts/,
            use: { ...devices["Desktop Safari"] },
          },
        ]
      : []),

    /* Mobile viewports — scoped to the public-facing survey and public pages,
       which are the primary mobile surfaces. Keeping scope narrow avoids
       multiplying all admin/project tests across mobile. */
    {
      name: "mobile-chrome",
      dependencies: ["setup"],
      testMatch: /tests\/(survey|public)\/.+\.spec\.ts/,
      use: { ...devices["Pixel 5"] },
    },
    ...(runAllBrowsers
      ? [
          {
            name: "mobile-safari",
            dependencies: ["setup"],
            testMatch: /tests\/(survey|public)\/.+\.spec\.ts/,
            use: { ...devices["iPhone 12"] },
          },
        ]
      : []),

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  webServer: {
    command: "bun tests/prepareAndStartDev.ts",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: toSpawnEnv(e2eEnv),
  },
})
