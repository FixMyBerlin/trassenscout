"use client"
import { useParams } from "next/navigation"

export const useTrySlug = (inputSlug: string) => {
  const slug = useParams()?.[inputSlug]

  return Array.isArray(slug) ? slug[0] : slug
}

export const useSlug = (inputSlug: string) => {
  const rawSlug = useParams()?.[inputSlug]
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug

  // We cannot use invariant here, because Blitz first render will return `undefined`
  // It is OK, though, to force this with TS with `!`
  // invariant(slug)
  return slug!
}

export const useTrySlugId = (slugId: string) => {
  const rawId = useParams()?.[slugId]
  const id = Array.isArray(rawId) ? rawId[0] : rawId

  return id ? Number(id) : undefined
}

export const useSlugId = (slugId: string) => {
  const rawId = useParams()?.[slugId]
  const id = Array.isArray(rawId) ? rawId[0] : rawId

  return Number(id)!
}
