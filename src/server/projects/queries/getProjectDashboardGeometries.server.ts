import { featureCollection, point } from "@turf/helpers"
import { bbox, simplify, truncate } from "@turf/turf"
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  LineString,
  Point,
  Polygon,
  Position,
} from "geojson"
import type { UnifiedFeatureProperties } from "@/src/components/core/components/Map/layers/UnifiedFeaturesLayer"
import type { Bbox2D } from "@/src/components/core/components/Map/utils/bboxHelpers"
import { lineStringToGeoJSON } from "@/src/components/core/components/Map/utils/lineStringToGeoJSON"
import { polygonToGeoJSON } from "@/src/components/core/components/Map/utils/polygonToGeoJSON"
import { GeometryTypeEnum } from "@/src/prisma/generated/client"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { typeSubsectionGeometry } from "@/src/server/subsections/utils/typeSubsectionGeometry"
import {
  areaLabelAnchors,
  lineLabelAnchors,
  type PartOfLabelAnchor,
  type PartOfLabelProperties,
  partOfGroupKey,
} from "@/src/shared/dashboard/partOfLabels"
import { mergeContiguousLines } from "@/src/shared/geometry/mergeContiguousLines"

const DASHBOARD_GEOMETRY_PRECISION = 5
// Degrees; limits dashboard payload fidelity.
const DASHBOARD_GEOMETRY_SIMPLIFY_TOLERANCE = 0.00003
// Degrees; only stitches subsection endpoints.
const DASHBOARD_GEOMETRY_MERGE_TOLERANCE = 0.0003
// Degrees (~2 km); small gaps between sections still count as one route for the label.
const PART_OF_LABEL_GAP_TOLERANCE = 0.02
const AREA_LABEL_ANCHOR_CACHE_LIMIT = 200

// Union of unsimplified areas is slow, so anchors are kept until a subsection changes.
const areaLabelAnchorCache = new Map<string, PartOfLabelAnchor[]>()

function cachedAreaLabelAnchors(versions: string[], areas: Feature<Polygon>[]) {
  if (areas.length === 0) return []
  const key = [...versions].sort().join(",")
  const cached = areaLabelAnchorCache.get(key)
  if (cached) return cached

  const anchors = areaLabelAnchors(areas)
  if (areaLabelAnchorCache.size >= AREA_LABEL_ANCHOR_CACHE_LIMIT) areaLabelAnchorCache.clear()
  areaLabelAnchorCache.set(key, anchors)
  return anchors
}

type PartOfGroup = {
  label: string
  lines: Position[][]
  areas: Feature<Polygon>[]
  areaVersions: string[]
}

function simplifyDashboardFeature<T extends LineString | Polygon, P extends GeoJsonProperties>(
  input: Feature<T, P>,
) {
  try {
    const simplified = simplify(input, {
      tolerance: DASHBOARD_GEOMETRY_SIMPLIFY_TOLERANCE,
      highQuality: false,
      mutate: false,
    })
    const truncated = truncate(simplified, { precision: DASHBOARD_GEOMETRY_PRECISION })

    if (truncated.geometry.type === input.geometry.type) {
      return truncated as Feature<T, P>
    }
  } catch {
    // Fall back to coordinate truncation if Turf cannot simplify an edge-case geometry.
  }

  return truncate(input, { precision: DASHBOARD_GEOMETRY_PRECISION }) as Feature<T, P>
}

export async function getProjectDashboardGeometries(headers: Headers): Promise<{
  lines: FeatureCollection<LineString, UnifiedFeatureProperties>
  polygons: FeatureCollection<Polygon, UnifiedFeatureProperties>
  partOfLabels: FeatureCollection<Point, PartOfLabelProperties>
  boundingBox: Bbox2D | null
}> {
  const session = await endpointAuth.session(headers)

  const projects = await db.project.findMany({
    // Note: We don't have a "ADMIN" sees all here, because that would fill the Dashboard with a map of all projects
    where: { memberships: { some: { userId: Number(session.userId) } } },
    orderBy: { slug: "asc" },
    select: {
      slug: true,
      partOf: true,
      subsections: {
        where: { type: { in: [GeometryTypeEnum.LINE, GeometryTypeEnum.POLYGON] } },
        orderBy: { order: "asc" },
        select: {
          id: true,
          updatedAt: true,
          geometry: true,
          type: true,
        },
      },
    },
  })

  const lines: Feature<LineString, UnifiedFeatureProperties>[] = []
  const polygons: Feature<Polygon, UnifiedFeatureProperties>[] = []
  const partOfGroups = new Map<string, PartOfGroup>()

  projects.forEach((project) => {
    const properties = {
      projectSlug: project.slug,
      style: "REGULAR",
      // Required: UnifiedFeaturesLayer colors by `isCurrent`, and every project on the dashboard
      // is primary. Note this view has no DASHED styling — `style` is always REGULAR here.
      isCurrent: true,
    } satisfies Omit<UnifiedFeatureProperties, "featureId">

    const partOf = project.partOf?.trim()
    const projectLineCoordinates: Position[][] = []
    const projectAreas: Feature<Polygon>[] = []
    const projectAreaVersions: string[] = []

    project.subsections.forEach((subsection) => {
      try {
        const typedSubsection = typeSubsectionGeometry(subsection)

        if (typedSubsection.type === "LINE") {
          lineStringToGeoJSON(typedSubsection.geometry).forEach((feature) => {
            projectLineCoordinates.push(
              simplifyDashboardFeature(feature).geometry.coordinates as Position[],
            )
          })
          return
        }

        const areas = polygonToGeoJSON(typedSubsection.geometry, properties)
        polygons.push(
          ...areas.map((feature, index) =>
            simplifyDashboardFeature({
              ...feature,
              properties: {
                ...feature.properties,
                featureId: `project-${project.slug}-subsection-${subsection.id}-polygon-${index}`,
              },
            }),
          ),
        )
        if (partOf) {
          projectAreas.push(...areas)
          projectAreaVersions.push(`${subsection.id}:${subsection.updatedAt.getTime()}`)
        }
      } catch {
        // Skip malformed legacy/imported geometries so one bad subsection does not remove all dashboard geometry.
      }
    })

    // Dashboard renders project lines as one entity, without subsection-level identity.
    const projectLines = mergeContiguousLines(
      projectLineCoordinates,
      DASHBOARD_GEOMETRY_MERGE_TOLERANCE,
    )
    projectLines.forEach((coordinates, index) => {
      lines.push({
        type: "Feature",
        geometry: { type: "LineString", coordinates },
        properties: { ...properties, featureId: `project-${project.slug}-line-${index}` },
      })
    })

    if (partOf) {
      const key = partOfGroupKey(partOf)
      const group = partOfGroups.get(key) ?? {
        label: partOf,
        lines: [],
        areas: [],
        areaVersions: [],
      }
      group.lines.push(...projectLines)
      group.areas.push(...projectAreas)
      group.areaVersions.push(...projectAreaVersions)
      partOfGroups.set(key, group)
    }
  })

  const partOfLabels = [...partOfGroups.values()].flatMap(
    ({ label, lines: groupLines, areas, areaVersions }) =>
      [
        ...lineLabelAnchors(groupLines, PART_OF_LABEL_GAP_TOLERANCE),
        ...cachedAreaLabelAnchors(areaVersions, areas),
      ].map(({ coordinates, rotate }) => point(coordinates, { label, rotate })),
  )

  const geometryFeatures = [...lines, ...polygons]
  const geometryFeatureCollection: FeatureCollection<
    LineString | Polygon,
    UnifiedFeatureProperties
  > = {
    type: "FeatureCollection",
    features: geometryFeatures,
  }

  return {
    lines: featureCollection(lines),
    polygons: featureCollection(polygons),
    partOfLabels: featureCollection(partOfLabels),
    boundingBox: geometryFeatures.length > 0 ? (bbox(geometryFeatureCollection) as Bbox2D) : null,
  }
}
