"use client"
// import { init } from "@socialgouv/matomo-next"
// import { useEffect, useRef } from "react"

const MATOMO_URL = "https://s.fixmycity.de"
const MATOMO_SITE_ID = "7"

export const useMatomo = () => {
  // The Matomo Plugin we use does not work in the app directory ATM
  // See https://github.com/SocialGouv/matomo-next/issues/99
  //
  //
  //
  // const matomoInitialized = useRef(false)
  // useEffect(() => {
  //   if (MATOMO_URL && MATOMO_SITE_ID && matomoInitialized.current === false) {
  //     init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
  //   }
  //   return () => {
  //     matomoInitialized.current = true
  //   }
  // }, [])
}
