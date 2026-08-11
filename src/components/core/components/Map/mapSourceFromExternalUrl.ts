import { MapSourceType } from "./mapDataTypes"

/**
 * Resolve MapLibre Source props from config `sourceId` + `externalUrl`.
 * Callers must pass the full endpoint including format suffix
 * (TILDA: `.geojson` / `.pmtiles`; Trassenscout project export: `.json`).
 * Extensionless TILDA `/api/uploads/{slug}` URLs are deprecated (legacy PMTiles fallback).
 */
export function mapSourceFromExternalUrl(
  sourceId: string,
  externalUrl: string,
  type: MapSourceType,
) {
  switch (type) {
    case MapSourceType.geojson:
      return { id: sourceId, type: "geojson" as const, data: externalUrl }
    case MapSourceType.pmtiles:
      return { id: sourceId, type: "vector" as const, url: `pmtiles://${externalUrl}` }
  }
}
