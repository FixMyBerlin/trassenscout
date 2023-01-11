export const TODO_isProd = process.env.NODE_ENV === "production"

export const TODO_isStaging =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_NETLIFY_CONTEXT === "staging"

export const isDev = process.env.NODE_ENV === "development"

export const isBrowser = typeof window !== "undefined"
export const isSSR = !isBrowser
