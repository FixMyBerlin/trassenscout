import { isDev } from "./isEnv"

export const getImageSrc = (logoSrc: string) => {
  const origin = isDev ? "https://staging.trassenscout.de" : location.origin
  return `${origin}/assets/${logoSrc}`
}
