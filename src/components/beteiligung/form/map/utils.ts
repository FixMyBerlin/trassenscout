import { bbox, lineString, multiLineString, point, polygon } from "@turf/turf"
import type { Map as MaplibreMap } from "maplibre-gl"
import { z } from "zod"
import type { MapData } from "@/src/components/beteiligung/shared/types"
import { MapSourceType } from "@/src/components/beteiligung/shared/types"
import { geometryAnchorPoint } from "@/src/components/core/components/Map/utils/geometryAnchorPoint"
import { PositionArraySchema, PositionSchema } from "@/src/shared/geometry/geojsonSchemas"
import type { SupportedGeometry } from "@/src/shared/geometry/geometrySchemas"

/** `location` value for SwitchableMap (GeoJSON Point → `{ lng, lat }`). */
const SwitchableMapLocationPointSchema = z.object({
  lng: z.number(),
  lat: z.number(),
})
export type SwitchableMapLocationPoint = z.infer<typeof SwitchableMapLocationPointSchema>

/** Survey map fields store bare coordinates (not full GeoJSON `{ type, coordinates }`). */
const SurveyPointCoordsSchema = PositionSchema
const SurveyLineStringCoordsSchema = PositionArraySchema.min(2)
const SurveyMultiLineStringCoordsSchema = z.array(SurveyLineStringCoordsSchema)
const SurveyPolygonRingSchema = SurveyLineStringCoordsSchema.min(4).refine(
  (ring) => {
    const first = ring[0]
    const last = ring[ring.length - 1]
    return first != null && last != null && first[0] === last[0] && first[1] === last[1]
  },
  { error: "Polygon ring must be closed" },
)
/**
 * GeoJSON Polygon `coordinates` as persisted by GeoCategoryMap (`[[[lng,lat],…]]`).
 * Checked before MultiLineString — both are Position[][], distinguished by closed rings.
 */
const SurveyPolygonCoordsSchema = z.array(SurveyPolygonRingSchema).min(1)

function parseJsonUnknown(value: string) {
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

/**
 * Classifies bare survey coordinate JSON (e.g. `[lng,lat]` or line/polygon rings)
 * using shared Position schemas.
 *
 * Polygons are only nested GeoJSON Polygon coords (closed rings). A closed LineString
 * stays `lineString` — prod has no flat-ring polygon storage.
 */
export const detectGeometryType = (geometryString: string) => {
  const parsed = parseJsonUnknown(geometryString)
  if (parsed == null) return "unknown" as const

  if (SurveyPointCoordsSchema.safeParse(parsed).success) return "point" as const
  // Nested closed rings (GeoJSON Polygon coords) before MultiLineString — same nesting depth.
  if (SurveyPolygonCoordsSchema.safeParse(parsed).success) return "polygon" as const
  if (SurveyMultiLineStringCoordsSchema.safeParse(parsed).success) return "multiLineString" as const
  if (SurveyLineStringCoordsSchema.safeParse(parsed).success) return "lineString" as const
  return "unknown" as const
}

/**
 * Validates a SwitchableMap `location` value from survey response JSON (`unknown`).
 * Form state is already typed as `SwitchableMapLocationPoint | null` — use it directly there.
 */
export function parseSwitchableMapLocationFieldValue(value: unknown) {
  const parsed = SwitchableMapLocationPointSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

export const createGeoJSONFromString = (
  geometryString: string,
  properties?: {
    [name: string]: any
  },
  options?: { [id: string]: string | number },
) => {
  const parsed = parseJsonUnknown(geometryString)
  if (parsed == null) {
    throw new Error(`Unsupported geometry type: unknown`)
  }

  const pointCoords = SurveyPointCoordsSchema.safeParse(parsed)
  if (pointCoords.success) {
    return point(pointCoords.data, { ...properties, geometryType: "point" }, options)
  }

  const polygonCoords = SurveyPolygonCoordsSchema.safeParse(parsed)
  if (polygonCoords.success) {
    return polygon(polygonCoords.data, { ...properties, geometryType: "polygon" }, options)
  }

  const multiLineCoords = SurveyMultiLineStringCoordsSchema.safeParse(parsed)
  if (multiLineCoords.success) {
    return multiLineString(multiLineCoords.data, { ...properties, geometryType: "line" }, options)
  }

  const lineCoords = SurveyLineStringCoordsSchema.safeParse(parsed)
  if (lineCoords.success) {
    return lineString(lineCoords.data, { ...properties, geometryType: "line" }, options)
  }

  throw new Error(`Unsupported geometry type: unknown`)
}

export const getInitialViewStateFromGeometryString = (geometryString: string) => {
  if (!geometryString || typeof geometryString !== "string") {
    return undefined
  }

  try {
    const geoJSON = createGeoJSONFromString(geometryString)
    if (geoJSON.geometry.type === "Point") {
      const [lng, lat] = geoJSON.geometry.coordinates
      return {
        latitude: lat!,
        longitude: lng!,
        zoom: 12,
      }
    }

    return {
      bounds: bbox(geoJSON) as [number, number, number, number],
      fitBoundsOptions: { padding: 70 },
    }
  } catch {
    return undefined
  }
}

/** Pin on the selected geometry (same anchor helper as map labels/popups). */
export function latLngOnGeometryCategory(geometryString: string) {
  try {
    const feature = createGeoJSONFromString(geometryString)
    const anchor = geometryAnchorPoint(feature.geometry as SupportedGeometry)
    if (!anchor) return null
    return { lat: anchor.latitude, lng: anchor.longitude }
  } catch {
    return null
  }
}

/** MapLibre `setFeatureState` needs `sourceLayer` for vector/PMTiles sources, not for GeoJSON sources. */
export function featureStateTargetForMapSource(
  mapData: MapData,
  source: string,
  id: string | number,
) {
  const config = mapData.sources[source]
  if (config?.type === MapSourceType.geojson) {
    return { source, id }
  }
  return { source, sourceLayer: "default" as const, id }
}

/**
 * Ephemeral form fields written by GeoCategoryMap / SwitchableMap for MapLibre feature-state.
 * `undefined` = no selection (cleared on mode change); otherwise set from `feature.source` / `feature.id`.
 */
type GeometryCategoryFeatureSelection = {
  geometryCategorySourceId: string
  geometryCategoryFeatureId: string | number
}

type GetSurveyFieldValue = {
  <K extends keyof GeometryCategoryFeatureSelection>(
    name: K,
  ): GeometryCategoryFeatureSelection[K] | undefined
}

/**
 * Re-apply `selected` feature-state from form values after the map style is ready.
 * Selection is always by MapLibre feature `id` (plus source / sourceLayer).
 */
export function applySelectedGeometryCategoryFeatureState(
  map: MaplibreMap | undefined,
  mapData: MapData | undefined,
  getFieldValue: GetSurveyFieldValue,
) {
  if (!map || !mapData || !map.isStyleLoaded()) return

  const sourceId = getFieldValue("geometryCategorySourceId")
  const featureId = getFieldValue("geometryCategoryFeatureId")
  if (sourceId == null || featureId == null) return

  map.setFeatureState(featureStateTargetForMapSource(mapData, sourceId, featureId), {
    selected: true,
  })
}
