import { isDev } from "./isEnv"

export const getImageSrc = (logoSrc: string) => {
  if (isDev) return "https://staging.trassenscout.de" + "/" + logoSrc
  return process.env.APP_ORIGIN?.replace("http", "https") + "/" + logoSrc
}
