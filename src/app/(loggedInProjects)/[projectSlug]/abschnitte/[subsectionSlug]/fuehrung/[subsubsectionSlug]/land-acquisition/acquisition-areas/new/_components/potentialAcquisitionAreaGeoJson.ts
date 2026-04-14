import { feature, featureCollection } from "@turf/helpers"
import type { Feature, MultiPolygon, Polygon } from "geojson"
import type { PotentialAcquisitionArea } from "./potentialAcquisitionAreaTypes"

export function polygonFeatureToFeatureCollection(
  polygonFeature: Feature<Polygon | MultiPolygon> | null,
) {
  if (!polygonFeature?.geometry) {
    return featureCollection([])
  }
  return featureCollection([polygonFeature])
}

export function potentialAcquisitionAreasToFeatureCollection(
  areas: PotentialAcquisitionArea[],
  selected: boolean,
) {
  return featureCollection(
    areas.filter((a) => a.selected === selected).map((a) => feature(a.geometry)),
  )
}
