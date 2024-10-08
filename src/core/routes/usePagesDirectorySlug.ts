"use client"
import { useParam } from "@blitzjs/next"

export const useTrySlug = (inputSlug: string) => {
  return useParam(inputSlug, "string")!
}

export const useSlug = (inputSlug: string) => {
  const slug = useParam(inputSlug, "string")

  // We cannot use invariant here, because Blitz first render will return `undefined`
  // It is OK, though, to force this with TS with `!`
  // invariant(slug)
  return slug!
}
