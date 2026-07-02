import { z } from "zod"
import { getLabelPosition } from "@/src/components/core/components/Map/utils/getLabelPosition"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { typeSubsectionGeometry } from "@/src/server/subsections/utils/typeSubsectionGeometry"
import { PointGeometrySchema } from "@/src/shared/geometry/geojsonSchemas"
import { subsubsectionGeometryTypeValidationRefine } from "@/src/shared/geometry/geometryTypeValidation"
import { ImportSubsubsectionDataSchema } from "./importSchema"
import { m2mFieldRelationNames, m2mFields, type M2MFieldsType } from "./m2mFields"

const ImportSubsubsectionRequestSchema = z.object({
  projectSlug: z.string(),
  subsectionSlug: z.string(),
  slug: z.string(),
  userId: z.number(),
  data: ImportSubsubsectionDataSchema,
})

function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }))
}

export async function importSubsubsectionFromApi(request: Request) {
  endpointAuth.apiKey(request)

  try {
    const body = await request.json()
    const parsed = ImportSubsubsectionRequestSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid request data",
          details: formatZodIssues(parsed.error),
        },
        { status: 400 },
      )
    }

    const { projectSlug, subsectionSlug, slug, userId, data } = parsed.data

    const project = await db.project.findFirst({
      where: { slug: projectSlug },
      select: { id: true },
    })

    if (!project) {
      return Response.json({ error: "Project not found", projectSlug }, { status: 404 })
    }

    const subsection = await db.subsection.findFirst({
      where: {
        slug: subsectionSlug,
        project: {
          slug: projectSlug,
        },
      },
      select: { id: true, geometry: true, type: true },
    })

    if (!subsection) {
      return Response.json(
        { error: "Subsection not found", projectSlug, subsectionSlug },
        { status: 404 },
      )
    }

    const typedSubsection = typeSubsectionGeometry(subsection)
    const subsectionGeometry = typedSubsection.geometry

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
      delete data.subsubsectionTaskSlug
    }

    const existing = await db.subsubsection.findFirst({
      where: {
        slug,
        subsectionId: subsection.id,
      },
    })

    const calculateFallbackGeometry = () => {
      const coordinates = getLabelPosition(subsectionGeometry)
      return PointGeometrySchema.parse({
        type: "Point",
        coordinates,
      })
    }

    const applyFallback = !data.geometry && !existing
    if (applyFallback) {
      data.type = "POINT"
      data.geometry = calculateFallbackGeometry()
      data.description = ["‼️ Platzhalter-Geometrie", data.description].filter(Boolean).join("\n\n")
    }

    const subsubsectionData: Record<string, unknown> = {
      ...data,
      subsectionId: subsection.id,
    }

    if (subsubsectionData.geometry && subsubsectionData.type) {
      const validationSchema = subsubsectionGeometryTypeValidationRefine(
        z.object({
          geometry: z.any(),
          type: z.any(),
        }),
      )
      const validationResult = validationSchema.safeParse({
        geometry: subsubsectionData.geometry,
        type: subsubsectionData.type,
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

    const connect: Record<M2MFieldsType | string, { connect: { id: number }[] | undefined }> = {}
    m2mFields.forEach((fieldName) => {
      const relationName = m2mFieldRelationNames[fieldName]
      if (subsubsectionData[fieldName]) {
        connect[relationName] = {
          connect: (subsubsectionData[fieldName] as number[]).map((id) => ({ id })),
        }
        delete subsubsectionData[fieldName]
      } else {
        connect[relationName] = { connect: [] }
      }
    })

    let result
    let action: "created" | "updated"

    if (existing) {
      const disconnect: Record<M2MFieldsType | string, { set: [] }> = {}
      m2mFields.forEach((fieldName) => {
        disconnect[m2mFieldRelationNames[fieldName]] = { set: [] }
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

      await createLogEntry({
        action: "UPDATE",
        message: `Maßnahme  ${shortTitle(result.slug)} wurde über CSV-Import aktualisiert`,
        userId,
        projectId: project.id,
        subsectionId: subsection.id,
        previousRecord: existing,
        updatedRecord: result,
      })
    } else {
      result = await db.subsubsection.create({
        data: { ...subsubsectionData, ...connect } as Parameters<
          typeof db.subsubsection.create
        >[0]["data"],
      })
      action = "created"

      await createLogEntry({
        action: "CREATE",
        message: `Neue Maßnahme  ${shortTitle(result.slug)} per CSV-Import`,
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
  } catch (error: unknown) {
    console.error("Error in subsubsection import API:", error)
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
