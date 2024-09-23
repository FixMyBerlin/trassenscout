"use client"
import { useParams } from "next/navigation"
import invariant from "tiny-invariant"

export const useTrySlug = (inputSlug: string) => {
  const slug = useParams()?.[inputSlug]

  return Array.isArray(slug) ? slug[0] : slug
}

export const useSlug = (inputSlug: string) => {
  const rawSlug = useParams()?.[inputSlug]
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug

  invariant(slug)
  return slug
}
