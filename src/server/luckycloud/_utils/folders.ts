export function getLuckyCloudFolder() {
  const env = process.env.NEXT_PUBLIC_APP_ENV

  switch (env) {
    case "production":
      return "TRASSENSCOUT_PRODUCTION"
    case "staging":
      return "TRASSENSCOUT_STAGING"
    case "development":
      return "TRASSENSCOUT_DEVELOPMENT"
  }
}

// Archive folder is at root level (/_ARCHIV), not inside ENV folders
// UI may show nested path, but API requires root level
export function getLuckyCloudArchivFolder() {
  return "_ARCHIV"
}
