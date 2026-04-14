import type { Feature, MultiPolygon, Polygon } from "geojson"
import type { PotentialAcquisitionArea } from "./potentialAcquisitionAreaTypes"

export function bufferOutlineFeatureCollection(
  bufferPolygonFeature: Feature<Polygon | MultiPolygon> | null,
) {
  if (!bufferPolygonFeature?.geometry) {
    return { type: "FeatureCollection" as const, features: [] }
  }
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {},
        geometry: bufferPolygonFeature.geometry,
      },
    ],
  }
}

export function potentialAcquisitionAreasToFeatureCollection(
  areas: PotentialAcquisitionArea[],
  selected: boolean,
) {
  return {
    type: "FeatureCollection" as const,
    features: areas
      .filter((a) => a.selected === selected)
      .map((a) => ({
        type: "Feature" as const,
        properties: {},
        geometry: a.geometry,
      })),
  }
}
