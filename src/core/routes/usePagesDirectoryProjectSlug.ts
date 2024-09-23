"use client"
import { useParam } from "@blitzjs/next"

export const useTryProjectSlug = () => {
  return useParam("projectSlug", "string")
}

export const useProjectSlug = () => {
  const slug = useParam("projectSlug", "string")!

  // We cannot use invariant here, because Blitz first render will return `undefined`
  // It is OK, though, to force this with TS with `!`
  // invariant(slug)
  return slug
}
