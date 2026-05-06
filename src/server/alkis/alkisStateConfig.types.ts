/**
 * ALKIS state config shape. Maintenance workflow: see `./README.md`.
 */

/** WMS background: absent (`url: false`) or URL + layer name together. */
export type AlkisWmsConfig = { url: false } | { url: string; layerName: string }

export type AlkisWfsDisabled = { url: false }

export type AlkisWfsEnabled = {
  url: string
  parcelPropertyKey: string
  alkisParcelIdPropertyKey: string | null
  projection: "EPSG:25832" | "EPSG:25833"
  wfsOutputFormat: string | null
  supports4326: boolean
  bboxAxisOrder: "lonlat" | "latlon"
  /** Derived from `wfsOutputFormat` (JSON / GeoJSON MIME). */
  wfsSupportsJson: boolean
}

export type AlkisWfsConfig = AlkisWfsDisabled | AlkisWfsEnabled

export enum AlkisAttributionLicense {
  CcBy40 = "CC BY 4.0",
  DlDeBy20 = "DL-DE BY 2.0",
  DlDeZero20 = "DL-DE Zero 2.0",
}

export const ALKIS_ATTRIBUTION_LICENSE_URL: Record<AlkisAttributionLicense, string> = {
  [AlkisAttributionLicense.CcBy40]: "https://creativecommons.org/licenses/by/4.0/deed.de",
  [AlkisAttributionLicense.DlDeBy20]: "https://www.govdata.de/dl-de/by-2-0",
  [AlkisAttributionLicense.DlDeZero20]: "https://www.govdata.de/dl-de/zero-2-0",
}

export type AlkisStateConfigEntry = {
  label: string
  enabled: boolean
  /** Manual dataset-level attribution; see `./README.md`. */
  attribution: { text: string; url: string; license: AlkisAttributionLicense } | null
  /** Optional human note (endpoint quirks, audit limitations); not used at runtime. */
  specialCaseNote: string | null
  wms: AlkisWmsConfig
  wfs: AlkisWfsConfig
}
