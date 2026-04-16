import { PotentialAcquisitionArea } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/[acquisitionAreaId]/_components/potentialAcquisitionAreaTypes"
import { feature, featureCollection } from "@turf/helpers"
import type { Feature, MultiPolygon, Polygon } from "geojson"

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
    areas.map((a) => feature(a.geometry, { featureId: a.id, alkisParcelId: a.alkisParcelId })),
  )
}
