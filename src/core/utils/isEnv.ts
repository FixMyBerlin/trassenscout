export const isProduction =
  process.env.NODE_ENV === "production" && process.env.APP_ORIGIN === "http://trassenscout.de"

export const isStaging =
  process.env.NODE_ENV === "production" &&
  process.env.APP_ORIGIN === "http://staging.trassenscout.de"

export const isDev = process.env.NODE_ENV === "development"

export const isBrowser = typeof window !== "undefined"
export const isSSR = !isBrowser
