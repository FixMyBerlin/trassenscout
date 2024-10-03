"use client"
import { useParams } from "next/navigation"

export const useTryProjectSlug = () => {
  const projectSlug = useParams()?.projectSlug

  return Array.isArray(projectSlug) ? projectSlug[0] : projectSlug
}

export const useProjectSlug = () => {
  const projectSlug = useParams()?.projectSlug
  const slug = Array.isArray(projectSlug) ? projectSlug[0] : projectSlug

  // We cannot use invariant here, because Blitz first render will return `undefined`
  // It is OK, though, to force this with TS with `!`
  // invariant(slug)
  return slug!
}
