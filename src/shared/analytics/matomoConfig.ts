/** Matomo's first-party opt-out cookie, still written under `disableCookies`; set means opted out. */
export const MATOMO_OPT_OUT_COOKIE = "mtm_consent_removed"

export const MATOMO_OPT_OUT_DIV_ID = "matomo-opt-out"

export type MatomoConfig = {
  trackerUrl: string
  scriptSrc: string
  optOutScriptSrc: string
  siteId: number
}

export const matomoConfig: MatomoConfig = {
  // Self-hosted Matomo on s.fixmycity.de (see PageDatenschutz opt-out widget).
  // Client privacy: disableCookies in matomoHead (root route head scripts).
  // Server privacy: IP masking etc. in Matomo admin — not configurable in JS.
  trackerUrl: "https://s.fixmycity.de/matomo.php",
  scriptSrc: "https://s.fixmycity.de/matomo.js",
  // JavaScript opt-out from Matomo admin "Datenschutz > Benutzer Opt-out"; renders into the div.
  optOutScriptSrc: `https://s.fixmycity.de/index.php?module=CoreAdminHome&action=optOutJS&divId=${MATOMO_OPT_OUT_DIV_ID}&language=de&showIntro=1`,
  siteId: 1,
}
