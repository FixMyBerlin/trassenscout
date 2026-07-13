export const isProduction = import.meta.env.VITE_APP_ENV === "production"

export const isStaging = import.meta.env.VITE_APP_ENV === "staging"

export const isDev = import.meta.env.VITE_APP_ENV === "development"

export const isTest = import.meta.env.MODE === "test"

/** Playwright E2E mode (`VITE_PLAYWRIGHT_ENABLED=true` in `.env.test`). */
export const isPlaywright = import.meta.env.VITE_PLAYWRIGHT_ENABLED === "true"
