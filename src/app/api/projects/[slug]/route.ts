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
        geometry: true,
        operator: { select: { title: true } },
        // these only exist in the subsubsection model
        // estimatedCompletionDate: true,
        // SubsubsectionStatus: { select: { slug: true } },
      },
    })

    if (subsections?.length === 0) {
      return new Response("No subsections found for the given project", { status: 404 })
    }

    const validSubsections = subsections.filter(
      (s) => s.geometry && Array.isArray(s.geometry) && s.geometry.length > 0,
    )

    if (validSubsections.length === 0) {
      return new Response("No valid subsections found for the given project", { status: 404 })
    }

    const projectFeatures = featureCollection(
      validSubsections.map((s) =>
        lineString(s.geometry as [number, number][], {
          operator: s.operator ? s.operator.title : null,
          // estimatedCompletionDate: s.estimatedCompletionDate,
          // status: s.SubsubsectionStatus ? s.SubsubsectionStatus.slug : null,
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
