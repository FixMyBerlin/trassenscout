"use client"

import { usePathname, useSearchParams } from "next/navigation"

export const useCurrentReturnTo = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  if (!pathname) return undefined

  const search = searchParams?.toString()

  if (!search) {
    return pathname
  }

  return `${pathname}?${search}`
}
