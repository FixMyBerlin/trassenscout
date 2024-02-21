import { getPrdOrStgDomain } from "../components/links/getDomain"

export const getImageSrc = (logoSrc: string) => {
  const origin = getPrdOrStgDomain()
  return `${origin}/assets/${logoSrc}`
}
