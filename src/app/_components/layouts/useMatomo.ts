"use client"
import { init } from "@socialgouv/matomo-next"
import { useEffect, useRef } from "react"

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID

export const useMatomo = () => {
  const matomoInitialized = useRef(false)

  useEffect(() => {
    if (MATOMO_URL && MATOMO_SITE_ID && matomoInitialized.current === false) {
      init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
    }
    return () => {
      matomoInitialized.current = true
    }
  }, [])

  return null
}
