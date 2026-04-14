export { STATE_TEST_COORDINATES } from "@/src/shared/alkisStateTestCoordinates"

export const AUDIT_SCHEMA_VERSION = 1
export const DEFAULT_TIMEOUT_MS = 45_000
export const DEFAULT_COUNT = 25
/** Single BBOX half-width in degrees around the test point (GetFeature probe). */
export const PROBE_BBOX_DELTA_DEGREES = 0.01 as const

export const PARCEL_ID_CANDIDATE_KEYS = [
  "flstkennz",
  "fsko",
  "flurstueckskennzeichen",
  "nationalCadastralReference",
  "gml_id",
] as const

export const OUTPUT_FORMAT_CANDIDATES = [
  "application/json",
  "application/geo+json",
  "application/json; subtype=geojson",
  "text/xml; subtype=gml/3.2.1",
] as const
