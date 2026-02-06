import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { feature, featureCollection, point } from "@turf/helpers"
import type { Feature, LineString, Point, Polygon } from "geojson"
import { extractLineEndpoints } from "./extractLineEndpoints"
import { lineStringToGeoJSON } from "./lineStringToGeoJSON"
import { pointToGeoJSON } from "./pointToGeoJSON"
import { polygonToGeoJSON } from "./polygonToGeoJSON"

type Props = {
  subsubsections: SubsubsectionWithPosition[]
  selectedSubsubsectionSlug: string | null
}

export type LineProperties = {
  subsectionSlug: string
  subsubsectionSlug: string
  style: "REGULAR" | "DASHED"
  isCurrent: boolean
  featureId: string
}

export type PointProperties = {
  subsectionSlug: string
  subsubsectionSlug: string
  style: "REGULAR" | "DASHED"
  isCurrent: boolean
  featureId: string
}

export type PolygonProperties = {
  subsectionSlug: string
  subsubsectionSlug: string
  style: "REGULAR" | "DASHED"
  isCurrent: boolean
  featureId: string
}

export type LineEndPointProperties = {
  lineId: string
  featureId: string
}

export const getSubsubsectionFeatures = ({ subsubsections, selectedSubsubsectionSlug }: Props) => {
  const lineFeatures: Feature<LineString, LineProperties>[] = []
  const lineEndPointFeatures: Feature<Point, LineEndPointProperties>[] = []
  const pointFeatures: Feature<Point, PointProperties>[] = []
  const polygonFeatures: Feature<Polygon, PolygonProperties>[] = []

  for (const subsubsection of subsubsections) {
    const isDashed = subsubsection.SubsubsectionStatus?.style === "DASHED"
    const isCurrent = subsubsection.slug === selectedSubsubsectionSlug
    switch (subsubsection.type) {
      case "LINE": {
        const features = lineStringToGeoJSON(subsubsection.geometry, {
          subsectionSlug: subsubsection.subsection.slug,
          subsubsectionSlug: subsubsection.slug,
          style: isDashed ? ("DASHED" as const) : ("REGULAR" as const),
          isCurrent,
        })
        features.forEach((feat, featureIndex) => {
          const featureId = `subsubsection-line-${subsubsection.slug}-${featureIndex}`
          lineFeatures.push(
            feature(feat.geometry, { ...feat.properties, featureId } satisfies LineProperties),
          )
        })

        // Extract line endpoints for subsubsection start/end points
        const endpoints = extractLineEndpoints(subsubsection.geometry)
        endpoints.forEach((endpoint, endpointIndex) => {
          const featureId = `subsubsection-endpoint-${subsubsection.slug}-${endpointIndex}`
          lineEndPointFeatures.push(
            point(endpoint, {
              lineId: subsubsection.slug,
              featureId,
            } satisfies LineEndPointProperties),
          )
        })
        break
      }
      case "POINT": {
        const features = pointToGeoJSON(subsubsection.geometry, {
          subsectionSlug: subsubsection.subsection.slug,
          subsubsectionSlug: subsubsection.slug,
          style: isDashed ? ("DASHED" as const) : ("REGULAR" as const),
          isCurrent,
        })
        features.forEach((feat, featureIndex) => {
          const featureId = `subsubsection-point-${subsubsection.slug}-${featureIndex}`
          pointFeatures.push(
            feature(feat.geometry, { ...feat.properties, featureId } satisfies PointProperties),
          )
        })
        break
      }
      case "POLYGON": {
        const features = polygonToGeoJSON(subsubsection.geometry, {
          subsectionSlug: subsubsection.subsection.slug,
          subsubsectionSlug: subsubsection.slug,
          style: isDashed ? ("DASHED" as const) : ("REGULAR" as const),
          isCurrent,
        })
        features.forEach((feat, featureIndex) => {
          const featureId = `subsubsection-polygon-${subsubsection.slug}-${featureIndex}`
          polygonFeatures.push(
            feature(feat.geometry, { ...feat.properties, featureId } satisfies PolygonProperties),
          )
        })
        break
      }
    }
  }

  return {
    lines: featureCollection(lineFeatures),
    points: featureCollection(pointFeatures),
    polygons: featureCollection(polygonFeatures),
    lineEndPoints: featureCollection(lineEndPointFeatures),
  } as const
}
