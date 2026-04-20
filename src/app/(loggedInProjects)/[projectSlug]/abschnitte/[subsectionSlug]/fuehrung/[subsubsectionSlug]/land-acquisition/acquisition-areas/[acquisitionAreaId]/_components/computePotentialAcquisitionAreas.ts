import { AcquisitionAreaGeometrySchema } from "@/src/server/acquisitionAreas/schema"
import type { AlkisWfsParcelFeatureCollection } from "@/src/server/alkis/alkisWfsParcelGeoJsonTypes"
import { booleanIntersects } from "@turf/boolean-intersects"
import { feature, featureCollection } from "@turf/helpers"
import { intersect } from "@turf/intersect"
import type { Feature, MultiPolygon, Polygon } from "geojson"
import type { PotentialAcquisitionArea } from "./potentialAcquisitionAreaTypes"

export function computePotentialAcquisitionAreas(
  bufferPolygonFeature: Feature<Polygon | MultiPolygon>,
  parcels: AlkisWfsParcelFeatureCollection,
) {
  const bufferFeature = bufferPolygonFeature
  const results: PotentialAcquisitionArea[] = []
  let seq = 0

  for (const parcel of parcels.features) {
    const geom = parcel.geometry
    if (geom.type !== "Polygon" && geom.type !== "MultiPolygon") continue

    const props = parcel.properties
    if (!props) continue

    const parcelFeature = feature(geom, props)

    if (!booleanIntersects(parcelFeature, bufferFeature)) continue

    const intersection = intersect(featureCollection([bufferFeature, parcelFeature]))
    if (!intersection?.geometry) continue

    seq += 1
    const { alkisParcelId, alkisParcelIdSource } = props

    results.push({
      id: String(seq),
      geometry: AcquisitionAreaGeometrySchema.parse(intersection.geometry),
      parcelGeometry: AcquisitionAreaGeometrySchema.parse(parcelFeature.geometry),
      alkisParcelId,
      alkisParcelIdSource,
      selected: false,
    })
  }

  return results
}
