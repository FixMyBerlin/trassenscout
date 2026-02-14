import type { GeometryByGeometryType } from "@/src/server/shared/utils/geometrySchemas"
import { GeometryTypeEnum } from "@prisma/client"
import { feature, featureCollection, point } from "@turf/helpers"
import type { Feature, LineString, Point, Polygon } from "geojson"
import { extractLineEndpoints } from "./extractLineEndpoints"
import { lineStringToGeoJSON } from "./lineStringToGeoJSON"
import { polygonToGeoJSON } from "./polygonToGeoJSON"

type SubsectionForFeatures =
  | {
      slug: string
      type: typeof GeometryTypeEnum.LINE
      geometry: GeometryByGeometryType<"LINE">
      SubsectionStatus?: { style: "REGULAR" | "DASHED" } | null
    }
  | {
      slug: string
      type: typeof GeometryTypeEnum.POLYGON
      geometry: GeometryByGeometryType<"POLYGON">
      SubsectionStatus?: { style: "REGULAR" | "DASHED" } | null
    }

type Props =
  | {
      subsections: SubsectionForFeatures[]
      highlight: "all"
    }
  | {
      subsections: SubsectionForFeatures[]
      highlight: "currentSubsection"
      selectedSubsectionSlug: string
    }

export type LineProperties = {
  subsectionSlug: string
  style: "REGULAR" | "DASHED"
  isCurrent: boolean
  featureId: string
}

export type PolygonProperties = {
  subsectionSlug: string
  style: "REGULAR" | "DASHED"
  isCurrent: boolean
  featureId: string
}

export type LineEndPointProperties = {
  subsectionSlug: string
  isCurrent: boolean
  featureId: string
}

export const getSubsectionFeatures = (props: Props) => {
  const { subsections } = props
  const lineFeatures: Feature<LineString, LineProperties>[] = []
  const lineEndPointFeatures: Feature<Point, LineEndPointProperties>[] = []
  const polygonFeatures: Feature<Polygon, PolygonProperties>[] = []

  for (const subsection of subsections) {
    const isDashed = subsection.SubsectionStatus?.style === "DASHED"
    const isCurrent =
      props.highlight === "all" ? true : subsection.slug === props.selectedSubsectionSlug
    switch (subsection.type) {
      case "LINE": {
        const features = lineStringToGeoJSON(subsection.geometry, {
          subsectionSlug: subsection.slug,
          style: isDashed ? ("DASHED" as const) : ("REGULAR" as const),
          isCurrent,
        })
        features.forEach((feat, featureIndex) => {
          const featureId = `subsection-line-${subsection.slug}-${featureIndex}`
          lineFeatures.push(
            feature(feat.geometry, { ...feat.properties, featureId } satisfies LineProperties),
          )
        })

        // Extract line endpoints for subsection start/end points
        const endpoints = extractLineEndpoints(subsection.geometry)
        endpoints.forEach((endpoint, endpointIndex) => {
          const featureId = `subsection-endpoint-${subsection.slug}-${endpointIndex}`
          lineEndPointFeatures.push(
            point(endpoint, {
              subsectionSlug: subsection.slug,
              isCurrent,
              featureId,
            } satisfies LineEndPointProperties),
          )
        })
        break
      }
      case "POLYGON": {
        const features = polygonToGeoJSON(subsection.geometry, {
          subsectionSlug: subsection.slug,
          style: isDashed ? ("DASHED" as const) : ("REGULAR" as const),
          isCurrent,
        })
        features.forEach((feat, featureIndex) => {
          const featureId = `subsection-polygon-${subsection.slug}-${featureIndex}`
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
    lineEndPoints: featureCollection(lineEndPointFeatures),
    polygons: featureCollection(polygonFeatures),
  }
}
