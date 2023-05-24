import { getPrdOrStgDomain } from "../components/links/getDomain"
import { isProduction } from "./isEnv"

export const getImageSrc = (logoSrc: string) => {
  const origin = getPrdOrStgDomain()
  return `${origin}/assets/${logoSrc}`
}
