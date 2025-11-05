import db from "@/db"
import { shortTitle } from "@/src/core/components/text/titles"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { ImportSubsubsectionDataSchema } from "@/src/server/subsubsections/importSchema"
import { m2mFields, type M2MFieldsType } from "@/src/server/subsubsections/m2mFields"
import { z } from "zod"
import { withApiKey } from "../../_utils/withApiKey"

const ImportSubsubsectionRequestSchema = z.object({
  projectSlug: z.string(),
  subsectionSlug: z.string(),
  slug: z.string(),
  userId: z.number(),
  data: ImportSubsubsectionDataSchema,
})

export const POST = withApiKey(async ({ request }) => {
  try {
    // Parse and validate request body
    const body = await request.json()
    const parsed = ImportSubsubsectionRequestSchema.safeParse(body)

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

    const { projectSlug, subsectionSlug, slug, userId, data } = parsed.data

    // Find the project to get projectId for slug lookups
    const project = await db.project.findFirst({
      where: { slug: projectSlug },
      select: { id: true },
    })

    if (!project) {
      return Response.json({ error: "Project not found", projectSlug }, { status: 404 })
    }

    // Find the subsection to get subsectionId and geometry
    const subsection = await db.subsection.findFirst({
      where: {
        slug: subsectionSlug,
        project: {
          slug: projectSlug,
        },
      },
      select: { id: true, geometry: true },
    })

    if (!subsection) {
      return Response.json(
        { error: "Subsection not found", projectSlug, subsectionSlug },
        { status: 404 },
      )
    }

    // Look up IDs from slugs if provided
    if (data.qualityLevelSlug) {
      const qualityLevel = await db.qualityLevel.findFirst({
        where: {
          slug: data.qualityLevelSlug,
          projectId: project.id,
        },
        select: { id: true },
      })
      if (qualityLevel) {
        data.qualityLevelId = qualityLevel.id
      }
      // Remove slug field
      delete data.qualityLevelSlug
    }

    if (data.subsubsectionStatusSlug) {
      const subsubsectionStatus = await db.subsubsectionStatus.findFirst({
        where: {
          slug: data.subsubsectionStatusSlug,
          projectId: project.id,
        },
        select: { id: true },
      })
      if (subsubsectionStatus) {
        data.subsubsectionStatusId = subsubsectionStatus.id
      }
      // Remove slug field
      delete data.subsubsectionStatusSlug
    }

    if (data.subsubsectionInfraSlug) {
      const subsubsectionInfra = await db.subsubsectionInfra.findFirst({
        where: {
          slug: data.subsubsectionInfraSlug,
          projectId: project.id,
        },
        select: { id: true },
      })
      if (subsubsectionInfra) {
        data.subsubsectionInfraId = subsubsectionInfra.id
      }
      // Remove slug field
      delete data.subsubsectionInfraSlug
    }

    if (data.subsubsectionTaskSlug) {
      const subsubsectionTask = await db.subsubsectionTask.findFirst({
        where: {
          slug: data.subsubsectionTaskSlug,
          projectId: project.id,
        },
        select: { id: true },
      })
      if (subsubsectionTask) {
        data.subsubsectionTaskId = subsubsectionTask.id
      }
      // Remove slug field
      delete data.subsubsectionTaskSlug
    }

    // Find existing subsubsection
    const existing = await db.subsubsection.findFirst({
      where: {
        slug,
        subsectionId: subsection.id,
      },
    })

    // Calculate fallback geometry for new records when geometry is not provided
    const calculateFallbackGeometry = (): [number, number] => {
      const subsectionGeometry = subsection.geometry as [number, number][]
      if (subsectionGeometry && subsectionGeometry.length > 0) {
        let minLng = subsectionGeometry[0]![0]
        let minLat = subsectionGeometry[0]![1]

        for (const [lng, lat] of subsectionGeometry) {
          if (lng < minLng) minLng = lng
          if (lat < minLat) minLat = lat
        }

        return [minLng, minLat] as [number, number]
      }
      return [0, 0] as [number, number]
    }

    // 1. When geometry is provided, use that; overwrite existing data
    // 2. When no geometry provided and updating existing record, preserve existing geometry (omit from update)
    // 3. When no geometry provided and creating new record, fall back to placeholder
    const applyFallback = !data.geometry && !existing
    if (applyFallback) {
      // Creating new record - apply fallback geometry and add warning to description
      data.type = "AREA"
      data.geometry = calculateFallbackGeometry()
      // Add placeholder marker to description when fallback is applied
      data.description = ["‼️ Platzhalter-Geometrie", data.description].filter(Boolean).join("\n\n")
    }

    // Prepare data with subsectionId
    const subsubsectionData: Record<string, any> = {
      ...data,
      subsectionId: subsection.id,
    }

    // Handle m2m fields
    const connect: Record<M2MFieldsType | string, { connect: { id: number }[] | undefined }> = {}
    m2mFields.forEach((fieldName) => {
      if (subsubsectionData[fieldName]) {
        connect[fieldName] = {
          connect: subsubsectionData[fieldName].map((id: number) => ({ id })),
        }
        delete subsubsectionData[fieldName]
      } else {
        connect[fieldName] = { connect: [] }
      }
    })

    let result
    let action: "created" | "updated"

    if (existing) {
      // Update: first disconnect all m2m relations, then reconnect and update
      const disconnect: Record<M2MFieldsType | string, { set: [] }> = {}
      m2mFields.forEach((fieldName) => {
        disconnect[fieldName] = { set: [] }
      })

      await db.subsubsection.update({
        where: { id: existing.id },
        data: disconnect,
      })

      result = await db.subsubsection.update({
        where: { id: existing.id },
        data: { ...subsubsectionData, ...connect },
      })
      action = "updated"

      // Create log entry for update
      await createLogEntry({
        action: "UPDATE",
        message: `Eintrag ${shortTitle(result.slug)} wurde über CSV-Import aktualisiert`,
        userId,
        projectId: project.id,
        subsectionId: subsection.id,
        previousRecord: existing,
        updatedRecord: result,
      })
    } else {
      // Create
      result = await db.subsubsection.create({
        // @ts-expect-error - m2mFields handling
        data: { ...subsubsectionData, ...connect },
      })
      action = "created"

      // Create log entry for create
      await createLogEntry({
        action: "CREATE",
        message: `Neuer Eintrag ${shortTitle(result.slug)} per CSV-Import`,
        userId,
        projectId: project.id,
        subsectionId: subsection.id,
      })
    }

    return Response.json({
      success: true,
      action,
      id: result.id,
      projectSlug,
      subsectionSlug,
      slug,
    })
  } catch (error: any) {
    console.error("Error in subsubsection import API:", error)
    return Response.json(
      {
        error: "Internal server error",
        message: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
})
