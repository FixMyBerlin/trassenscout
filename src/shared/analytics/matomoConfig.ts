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
