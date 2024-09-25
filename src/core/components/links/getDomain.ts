export const getPrdOrStgDomain = () => {
  // Blitz code via https://github.com/search?q=repo%3Ablitz-js%2Fblitz%20BLITZ_DEV_SERVER_ORIGIN&type=code
  // However, for our usecase we only want production with staging fallback.
  // Also, `BLITZ_DEV_SERVER_ORIGIN` was undefined when used in a frontend component.
  // const origin = process.env.APP_ORIGIN || process.env.BLITZ_DEV_SERVER_ORIGIN

  const origin =
    process.env.NEXT_PUBLIC_APP_ORIGIN?.replace("http:", "https:") ||
    "https://staging.trassenscout.de"

  // This is for `npm run mailpreview`
  // where we set the origin manually to get the logo to show up
  if (process.env?.npm_lifecycle_event === "mailpreview") {
    return process.env.BLITZ_DEV_SERVER_ORIGIN || origin
  }

  if (process.env.NODE_ENV === "development") {
    return process.env.BLITZ_DEV_SERVER_ORIGIN || origin
  }

  return origin
}
