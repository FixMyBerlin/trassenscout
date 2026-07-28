import { featureCollection } from "@turf/helpers"
import { pointOnFeature } from "@turf/turf"
import type { Feature } from "geojson"
import type { SupportedGeometry } from "@/src/shared/geometry/geometrySchemas"
import { geometryToFeatures } from "./geometryToFeatures"

/**
 * A stable point guaranteed to sit on/inside the geometry (unlike a centroid, which can
 * fall outside concave shapes).
 * Used to pin map popups to a feature instead of to the cursor, so they keep pointing at
 * the same place while the map pans, zooms or flies to a new bbox.
 *
 * Returns null for a geometry turf cannot place a point on. `PolygonGeometrySchema` has no
 * minimum on `coordinates` (unlike `LineStringGeometrySchema`, which has `.min(2)`), so a
 * degenerate row reaches this — and it must cost at most its own popup rather than throw out of
 * the render that builds the anchors for every feature on the map.
 *
 * The whole body is guarded, not just the length: turf throws in both directions and neither is
 * catchable by an emptiness check. `polygon([])` does NOT throw — it returns one feature with
 * `coordinates: []`, which `pointOnFeature` then rejects with "coordinates must contain numbers".
 * `polygon([[]])` throws earlier still, inside `geometryToFeatures`. Both verified against the
 * installed @turf 7.3.5.
 */
export const geometryAnchorPoint = (geometry: SupportedGeometry) => {
  try {
    const features: Feature<SupportedGeometry>[] = geometryToFeatures(geometry) ?? []
    if (features.length === 0) return null

    const [longitude, latitude] = pointOnFeature(featureCollection(features)).geometry.coordinates
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null

    return { longitude: longitude!, latitude: latitude! }
  } catch {
    return null
  }
}
