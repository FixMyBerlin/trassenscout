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

export type AlkisStateConfigEntry = {
  label: string
  enabled: boolean
  /** Manual dataset-level attribution; see `./README.md`. */
  attribution: { text: string; url: string; license: string } | null
  /** Optional human note (endpoint quirks, audit limitations); not used at runtime. */
  specialCaseNote: string | null
  wms: AlkisWmsConfig
  wfs: AlkisWfsConfig
}
