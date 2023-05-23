import { isProduction } from "./isEnv"

export const getImageSrc = (logoSrc: string) => {
  const origin = !isProduction ? "https://staging.trassenscout.de" : location.origin
  return `${origin}/assets/${logoSrc}`
}
