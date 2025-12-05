export const LUCKY_CLOUD_ARCHIVE_FOLDER_NAME = "_ARCHIVE" as const

export function getLuckyCloudLibraryName() {
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

export function getLuckyCloudProjectPath(projectSlug: string) {
  return `/${projectSlug}` as const
}

// Returns the relative path from the library root: /projectSlug/_ARCHIVE
export function getLuckyCloudArchivePath(projectSlug: string) {
  return `/${projectSlug}/${LUCKY_CLOUD_ARCHIVE_FOLDER_NAME}` as const
}
