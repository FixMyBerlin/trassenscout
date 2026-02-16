import { getPrdOrStgDomain } from "@/src/core/components/links/getDomain"
import { Route } from "next"

export const mailUrl = (input: Route<string>) => {
  const origin = getPrdOrStgDomain()
  return new URL(input, origin).toString()
}
