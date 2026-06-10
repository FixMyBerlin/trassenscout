export const isProduction = import.meta.env.VITE_APP_ENV === "production"

export const isStaging = import.meta.env.VITE_APP_ENV === "staging"

export const isDev = import.meta.env.VITE_APP_ENV === "development"

export const isTest = import.meta.env.MODE === "test"
