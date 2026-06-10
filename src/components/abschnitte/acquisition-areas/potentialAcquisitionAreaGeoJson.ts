import { feature, featureCollection } from "@turf/helpers"
import type { Feature, MultiPolygon, Polygon } from "geojson"
import type { PotentialAcquisitionArea } from "@/src/components/abschnitte/acquisition-areas/potentialAcquisitionAreaTypes"

export function polygonFeatureToFeatureCollection(
  polygonFeature: Feature<Polygon | MultiPolygon> | null,
) {
  if (!polygonFeature?.geometry) {
    return featureCollection([])
  }
  return featureCollection([polygonFeature])
}

export function potentialAcquisitionAreasToFeatureCollection(areas: PotentialAcquisitionArea[]) {
  return featureCollection(
    areas.map((a) =>
      feature(a.geometry, {
        featureId: a.id,
        alkisParcelId: a.alkisParcelId,
        hasExistingAcquisitionArea: Boolean(a.existingAcquisitionAreaId),
      }),
    ),
  )
}
