import db from "@/db"
import { featureCollection, lineString } from "@turf/helpers"

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug
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
        geometry: true,
        // do we want to have the slug here as well?
        operator: { select: { title: true } },
        estimatedCompletionDateString: true,
        SubsubsectionStatus: { select: { slug: true, title: true } },
      },
    })

    const projectFeatures = featureCollection(
      subsections.map((s) =>
        lineString(s.geometry as [number, number][], {
          subsectionSlug: s.slug,
          projectSlug: slug,
          operator: s.operator?.title,
          estimatedCompletionDateString: s.estimatedCompletionDateString,
          status: s.SubsubsectionStatus?.title,
        }),
      ),
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
