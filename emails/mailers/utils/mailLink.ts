import { getPrdOrStgDomain } from "@/src/core/components/links/getDomain"

export const mailLink = (path: string) => {
  const origin = getPrdOrStgDomain()
  return new URL(path, origin).toString()
}
