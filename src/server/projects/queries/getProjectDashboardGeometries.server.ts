import { featureCollection } from "@turf/helpers"
import { bbox, simplify, truncate } from "@turf/turf"
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  LineString,
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
import { mergeContiguousLines } from "@/src/shared/geometry/mergeContiguousLines"

const DASHBOARD_GEOMETRY_PRECISION = 5
// Degrees; limits dashboard payload fidelity.
const DASHBOARD_GEOMETRY_SIMPLIFY_TOLERANCE = 0.00003
// Degrees; only stitches subsection endpoints.
const DASHBOARD_GEOMETRY_MERGE_TOLERANCE = 0.0003

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
  boundingBox: Bbox2D | null
}> {
  const session = await endpointAuth.session(headers)

  const projects = await db.project.findMany({
    // Note: We don't have a "ADMIN" sees all here, because that would fill the Dashboard with a map of all projects
    where: { memberships: { some: { userId: Number(session.userId) } } },
    select: {
      slug: true,
      subsections: {
        where: { type: { in: [GeometryTypeEnum.LINE, GeometryTypeEnum.POLYGON] } },
        orderBy: { order: "asc" },
        select: {
          id: true,
          geometry: true,
          type: true,
        },
      },
    },
  })

  const lines: Feature<LineString, UnifiedFeatureProperties>[] = []
  const polygons: Feature<Polygon, UnifiedFeatureProperties>[] = []

  projects.forEach((project) => {
    const properties = {
      projectSlug: project.slug,
      style: "REGULAR",
      // Required: UnifiedFeaturesLayer colors by `isCurrent`, and every project on the dashboard
      // is primary. Note this view has no DASHED styling — `style` is always REGULAR here.
      isCurrent: true,
    } satisfies Omit<UnifiedFeatureProperties, "featureId">

    const projectLineCoordinates: Position[][] = []

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

        polygons.push(
          ...polygonToGeoJSON(typedSubsection.geometry, properties).map((feature, index) =>
            simplifyDashboardFeature({
              ...feature,
              properties: {
                ...feature.properties,
                featureId: `project-${project.slug}-subsection-${subsection.id}-polygon-${index}`,
              },
            }),
          ),
        )
      } catch {
        // Skip malformed legacy/imported geometries so one bad subsection does not remove all dashboard geometry.
      }
    })

    // Dashboard renders project lines as one entity, without subsection-level identity.
    mergeContiguousLines(projectLineCoordinates, DASHBOARD_GEOMETRY_MERGE_TOLERANCE).forEach(
      (coordinates, index) => {
        lines.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates },
          properties: { ...properties, featureId: `project-${project.slug}-line-${index}` },
        })
      },
    )
  })

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
    boundingBox: geometryFeatures.length > 0 ? (bbox(geometryFeatureCollection) as Bbox2D) : null,
  }
}
