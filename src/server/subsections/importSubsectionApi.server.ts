import { z } from "zod"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { subsectionGeometryTypeValidationRefine } from "@/src/shared/geometry/geometryTypeValidation"
import { ImportSubsectionDataSchema } from "./importSchema"

const ImportSubsectionRequestSchema = z.object({
  projectSlug: z.string(),
  slug: z.string(),
  userId: z.number(),
  data: ImportSubsectionDataSchema,
})

const FALLBACK_GEOMETRY = {
  type: "LineString" as const,
  coordinates: [
    [10.0, 51.0],
    [10.0001, 51.0001],
  ] as [number, number][],
}

function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }))
}

export async function importSubsectionFromApi(request: Request) {
  endpointAuth.apiKey(request)

  try {
    const body = await request.json()
    const parsed = ImportSubsectionRequestSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid request data",
          details: formatZodIssues(parsed.error),
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

    const subsectionData: Record<string, unknown> = {
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
            details: formatZodIssues(validationResult.error),
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
        data: subsectionData as Parameters<typeof db.subsection.create>[0]["data"],
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
  } catch (error: unknown) {
    console.error("Error in subsection import API:", error)
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    return Response.json(
      {
        error: "Internal server error",
        message,
      },
      { status: 500 },
    )
  }
}
