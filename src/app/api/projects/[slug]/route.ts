import db from "@/db"
import { featureCollection, lineString } from "@turf/helpers"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug
    const project = await db.project.findFirst({
      where: { slug },
      select: {
        isExportApi: true,
      },
    })

    if (!project) {
      return new Response("No project found for that slug", { status: 404 })
    }
    if (!project.isExportApi) {
      return new Response("The export for this project is disabled by the admin", { status: 404 })
    }

    const subsections = await db.subsection.findMany({
      where: { project: { slug } },
      select: {
        slug: true,
        geometry: true,
        // do we want to have the slug here as well?
        operator: { select: { title: true } },
        estimatedCompletionDate: true,
        SubsubsectionStatus: { select: { slug: true, title: true } },
      },
    })

    if (subsections?.length === 0) {
      return new Response("No subsections found for the given project", { status: 404 })
    }

    // we validate the linestring format on create and update with zod, so this should not be necessary, but the databse only "knows" that it is a json field
    const validSubsections = subsections.filter(
      (s) => s.geometry && Array.isArray(s.geometry) && s.geometry.length > 0,
    )

    if (validSubsections.length === 0) {
      return new Response("No valid subsections found for the given project", { status: 404 })
    }

    const projectFeatures = featureCollection(
      validSubsections.map((s) =>
        lineString(s.geometry as [number, number][], {
          subsectionSlug: s.slug,
          projectSlug: slug,
          operator: s.operator ? s.operator.title : null,
          estimatedCompletionDate: s.estimatedCompletionDate,
          status: s.SubsubsectionStatus
            ? { slug: s.SubsubsectionStatus.slug, title: s.SubsubsectionStatus.title }
            : null,
        }),
      ),
    )

    return new Response(JSON.stringify(projectFeatures), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching subsections:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
