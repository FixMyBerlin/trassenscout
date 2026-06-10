import { getPrdOrStgDomain } from "@/src/components/core/components/links/getDomain"

export const mailUrl = (input: string) => {
  const origin = getPrdOrStgDomain()
  return new URL(input, origin).toString()
}
