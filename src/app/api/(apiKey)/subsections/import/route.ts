import db from "@/db"
import { shortTitle } from "@/src/core/components/text/titles"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { subsectionGeometryTypeValidationRefine } from "@/src/server/shared/utils/geometryTypeValidation"
import { ImportSubsectionDataSchema } from "@/src/server/subsections/importSchema"
import { z } from "zod"
import { withApiKey } from "../../_utils/withApiKey"

export const dynamic = "force-dynamic" // required with withApiKey (uses request.url)

const ImportSubsectionRequestSchema = z.object({
  projectSlug: z.string(),
  slug: z.string(),
  userId: z.number(),
  data: ImportSubsectionDataSchema,
})

/** Minimal LineString placeholder (subsections may only use LINE or POLYGON, not POINT) */
const FALLBACK_GEOMETRY = {
  type: "LineString" as const,
  coordinates: [
    [10.0, 51.0],
    [10.0001, 51.0001],
  ] as [number, number][],
}

export const POST = withApiKey(async ({ request }) => {
  try {
    const body = await request.json()
    const parsed = ImportSubsectionRequestSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid request data",
          details: parsed.error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 },
      )
    }

    const { projectSlug, slug, userId, data } = parsed.data

    const project = await db.project.findFirst({
      where: { slug: projectSlug },
      select: { id: true },
    })

    if (!project) {
      return Response.json({ error: "Project not found", projectSlug }, { status: 404 })
    }

    const existing = await db.subsection.findFirst({
      where: {
        slug,
        projectId: project.id,
      },
    })

    const applyFallback = !data.geometry && !existing
    if (applyFallback) {
      data.type = "LINE"
      data.geometry = FALLBACK_GEOMETRY
      data.description = ["‼️ Platzhalter-Geometrie", data.description].filter(Boolean).join("\n\n")
    }

    const nextOrder = async () => {
      const maxOrder = await db.subsection.aggregate({
        where: { projectId: project.id },
        _max: { order: true },
      })
      return (maxOrder._max.order ?? 0) + 1
    }

    if (!existing && data.order === undefined) {
      data.order = await nextOrder()
    }

    const subsectionData: Record<string, any> = {
      ...data,
      projectId: project.id,
    }

    if (subsectionData.geometry && subsectionData.type) {
      const validationSchema = subsectionGeometryTypeValidationRefine(
        z.object({
          geometry: z.any(),
          type: z.any(),
        }),
      )
      const validationResult = validationSchema.safeParse({
        geometry: subsectionData.geometry,
        type: subsectionData.type,
      })
      if (!validationResult.success) {
        return Response.json(
          {
            error: "Invalid geometry type",
            details: validationResult.error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 },
        )
      }
    }

    let result
    let action: "created" | "updated"

    if (existing) {
      result = await db.subsection.update({
        where: { id: existing.id },
        data: subsectionData,
      })
      action = "updated"

      await createLogEntry({
        action: "UPDATE",
        message: `Planungsabschnitt ${shortTitle(result.slug)} wurde über CSV-Import aktualisiert`,
        userId,
        projectId: project.id,
        subsectionId: existing.id,
        previousRecord: existing,
        updatedRecord: result,
      })
    } else {
      result = await db.subsection.create({
        // @ts-expect-error - validated ImportSubsectionDataSchema + projectId
        data: subsectionData,
      })
      action = "created"

      await createLogEntry({
        action: "CREATE",
        message: `Neuer Planungsabschnitt ${shortTitle(result.slug)} per CSV-Import`,
        userId,
        projectId: project.id,
        subsectionId: result.id,
      })
    }

    return Response.json({
      success: true,
      action,
      id: result.id,
      projectSlug,
      slug,
    })
  } catch (error: any) {
    console.error("Error in subsection import API:", error)
    return Response.json(
      {
        error: "Internal server error",
        message: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
})
