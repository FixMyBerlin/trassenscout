/** True when the app runs in Playwright E2E mode (`VITE_PLAYWRIGHT_ENABLED=true`). */
export const isPlaywrightE2eEnv = () => process.env.VITE_PLAYWRIGHT_ENABLED === "true"
