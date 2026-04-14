import { AcquisitionAreaGeometrySchema } from "@/src/server/acquisitionAreas/schema"
import { booleanIntersects } from "@turf/boolean-intersects"
import { featureCollection } from "@turf/helpers"
import { intersect } from "@turf/intersect"
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from "geojson"
import type { PotentialAcquisitionArea } from "./potentialAcquisitionAreaTypes"

export function computePotentialAcquisitionAreas(
  bufferPolygonFeature: Feature<Polygon | MultiPolygon>,
  parcels: FeatureCollection<Geometry, Record<string, unknown>>,
) {
  const bufferFeature = bufferPolygonFeature
  const results: PotentialAcquisitionArea[] = []
  let seq = 0

  for (const parcel of parcels.features) {
    const geom = parcel.geometry
    if (geom.type !== "Polygon" && geom.type !== "MultiPolygon") continue

    const parcelFeature: Feature<Polygon | MultiPolygon> = {
      type: "Feature",
      properties: parcel.properties ?? {},
      geometry: geom,
    }

    if (!booleanIntersects(parcelFeature, bufferFeature)) continue

    const intersection = intersect(featureCollection([bufferFeature, parcelFeature]))
    if (!intersection?.geometry) continue

    seq += 1
    const props = parcel.properties as Record<string, unknown>
    const alkisParcelId = (props.alkisParcelId as string | null) ?? null
    const alkisParcelIdSource = props.alkisParcelIdSource as string

    results.push({
      id: String(seq),
      geometry: AcquisitionAreaGeometrySchema.parse(intersection.geometry),
      parcelGeometry: AcquisitionAreaGeometrySchema.parse(parcelFeature.geometry),
      alkisParcelId,
      alkisParcelIdSource,
      selected: alkisParcelId !== null,
    })
  }

  return results
}
