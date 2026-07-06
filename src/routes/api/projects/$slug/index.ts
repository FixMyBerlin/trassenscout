import { createFileRoute } from "@tanstack/react-router"
import { featureCollection } from "@turf/helpers"
import type { Feature } from "geojson"
import { lineStringToGeoJSON } from "@/src/components/core/components/Map/utils/lineStringToGeoJSON"
import { polygonToGeoJSON } from "@/src/components/core/components/Map/utils/polygonToGeoJSON"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { typeSubsectionGeometry } from "@/src/server/subsections/utils/typeSubsectionGeometry"

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
} as const

function normalizeProjectSlug(slug: string) {
  return slug.endsWith(".json") ? slug.replace(/\.json$/, "") : slug
}

export const Route = createFileRoute("/api/projects/$slug/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ params }) => {
        endpointAuth.public("public project export as GeoJSON")

        try {
          const projectSlug = normalizeProjectSlug(params.slug)

          const project = await db.project.findFirst({
            where: { slug: projectSlug },
            select: { exportEnabled: true },
          })

          if (!project) {
            return new Response(JSON.stringify({ error: "No project found for that slug" }), {
              status: 404,
              headers: corsHeaders,
            })
          }

          if (!project.exportEnabled) {
            return new Response(
              JSON.stringify({ error: "The export for this project is disabled by the admin" }),
              { status: 404, headers: corsHeaders },
            )
          }

          const subsections = await db.subsection.findMany({
            where: { project: { slug: projectSlug } },
            select: {
              slug: true,
              geometry: true,
              type: true,
              operator: { select: { title: true } },
              estimatedCompletionDateString: true,
              SubsectionStatus: { select: { title: true } },
            },
          })

          // Public GeoJSON export: one Feature per geometry part.
          // LINE → LineString feature(s); MultiLineString → one LineString feature per part.
          // POLYGON → Polygon feature(s); MultiPolygon → one Polygon feature per part.
          // Export properties are duplicated on every feature from the same subsection.
          const features = subsections.flatMap<Feature>((subsection) => {
            const typedSubsection = typeSubsectionGeometry(subsection)
            const properties = {
              subsectionSlug: subsection.slug,
              projectSlug,
              operator: subsection.operator?.title,
              estimatedCompletionDateString: subsection.estimatedCompletionDateString,
              status: subsection.SubsectionStatus?.title,
            }

            switch (typedSubsection.type) {
              case "LINE":
                return lineStringToGeoJSON(typedSubsection.geometry, properties)
              case "POLYGON":
                return polygonToGeoJSON(typedSubsection.geometry, properties)
            }
          })

          const projectFeatures = featureCollection(features)

          return new Response(JSON.stringify(projectFeatures), {
            headers: corsHeaders,
          })
        } catch (error) {
          console.error("Error fetching project export:", error)
          return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: corsHeaders,
          })
        }
      },
    },
  },
})
