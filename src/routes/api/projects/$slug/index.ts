import { createFileRoute } from "@tanstack/react-router"
import { featureCollection, lineString } from "@turf/helpers"
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

          // TODO: Handle other geometry types
          const projectFeatures = featureCollection(
            subsections
              .map((subsection) => {
                const { geometry } = typeSubsectionGeometry(subsection)
                if (geometry.type !== "LineString") return null

                return lineString(geometry.coordinates, {
                  subsectionSlug: subsection.slug,
                  projectSlug,
                  operator: subsection.operator?.title,
                  estimatedCompletionDateString: subsection.estimatedCompletionDateString,
                  status: subsection.SubsectionStatus?.title,
                })
              })
              .filter((feature) => feature !== null),
          )

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
