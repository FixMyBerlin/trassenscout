"use client"
import { useParams } from "next/navigation"
import invariant from "tiny-invariant"

export const useTryProjectSlug = () => {
  const projectSlug = useParams()?.projectSlug

  return Array.isArray(projectSlug) ? projectSlug[0] : projectSlug
}

export const useProjectSlug = () => {
  const projectSlug = useParams()?.projectSlug
  const slug = Array.isArray(projectSlug) ? projectSlug[0] : projectSlug

  invariant(slug)
  return slug
}
