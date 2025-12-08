import db from "@/db"
import { typeSubsectionGeometry } from "@/src/server/subsections/utils/typeSubsectionGeometry"
import { featureCollection, lineString } from "@turf/helpers"

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    let slug = (await params).slug

    if (slug.endsWith(".json")) {
      slug = slug.replace(/\.json$/, "")
    }

    const project = await db.project.findFirst({
      where: { slug },
      select: {
        exportEnabled: true,
      },
    })

    if (!project) {
      console.log("No project found for slug: ", slug)
      return new Response(JSON.stringify({ error: "No project found for that slug" }), {
        status: 404,
        headers: corsHeaders,
      })
    }
    if (!project.exportEnabled) {
      console.log("Export is disabled for project with slug: ", slug)
      return new Response(
        JSON.stringify({ error: "The export for this project is disabled by the admin" }),
        { status: 404, headers: corsHeaders },
      )
    }

    const subsections = await db.subsection.findMany({
      where: { project: { slug } },
      select: {
        slug: true,
        // gets typed below with `typeSubsectionGeometry`
        geometry: true,
        // do we want to have the slug here as well?
        operator: { select: { title: true } },
        estimatedCompletionDateString: true,
        SubsectionStatus: { select: { slug: true, title: true } },
      },
    })

    // TODO: Handle other geometry types
    const projectFeatures = featureCollection(
      subsections
        .map((subsection) => {
          const { geometry } = typeSubsectionGeometry(subsection)
          if (geometry.type != "LineString") return null
          return lineString(geometry.coordinates, {
            subsectionSlug: subsection.slug,
            projectSlug: slug,
            operator: subsection.operator?.title,
            estimatedCompletionDateString: subsection.estimatedCompletionDateString,
            status: subsection.SubsectionStatus?.title,
          })
        })
        .filter(Boolean),
    )

    return new Response(JSON.stringify(projectFeatures), {
      headers: corsHeaders,
    })
  } catch (error) {
    console.error("Error fetching subsections:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    })
  }
}
