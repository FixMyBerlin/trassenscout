/**
 * Matomo's own opt-out cookie, and the one it still writes under `disableCookies`. The opt-out
 * iframe posts the choice to this page, where the tracker writes the cookie first-party; its
 * mere presence means opted out.
 */
export const MATOMO_OPT_OUT_COOKIE = "mtm_consent_removed"

export type MatomoConfig = {
  trackerUrl: string
  scriptSrc: string
  siteId: number
}

export const matomoConfig: MatomoConfig = {
  // Self-hosted Matomo on s.fixmycity.de (see PageDatenschutz opt-out iframe).
  // Client privacy: disableCookies in matomoHead (root route head scripts).
  // Server privacy: IP masking etc. in Matomo admin — not configurable in JS.
  trackerUrl: "https://s.fixmycity.de/matomo.php",
  scriptSrc: "https://s.fixmycity.de/matomo.js",
  siteId: 1,
}
