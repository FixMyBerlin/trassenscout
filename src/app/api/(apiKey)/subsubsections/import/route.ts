import db from "@/db"
import { m2mFields, type M2MFieldsType } from "@/src/server/subsubsections/m2mFields"
import { SubsubsectionSchema } from "@/src/server/subsubsections/schema"
import { z } from "zod"

const ImportSubsubsectionRequestSchema = z.object({
  projectSlug: z.string(),
  subsectionSlug: z.string(),
  slug: z.string(),
  userId: z.number(),
  data: SubsubsectionSchema.omit({ subsectionId: true }).extend({
    // Allow slug fields in addition to ID fields
    qualityLevelSlug: z.string().optional(),
    subsubsectionStatusSlug: z.string().optional(),
    subsubsectionInfraSlug: z.string().optional(),
    subsubsectionTaskSlug: z.string().optional(),
  }),
})

type Environment = "dev" | "staging" | "production"

function getApiKeyForEnv(env: Environment): string | undefined {
  switch (env) {
    case "dev":
      return process.env.TS_API_KEY
    case "staging":
      return process.env.TS_API_KEY_STAGING
    case "production":
      return process.env.TS_API_KEY_PRODUCTION
  }
}

export async function POST(request: Request) {
  try {
    // Get API key from header or query param
    const apiKeyHeader = request.headers.get("x-api-key")
    const url = new URL(request.url)
    const apiKeyQuery = url.searchParams.get("apiKey")
    const apiKey = apiKeyHeader || apiKeyQuery

    // Determine environment from request header (optional, defaults to dev)
    const envHeader = request.headers.get("x-api-env") || "dev"
    const env = (
      ["dev", "staging", "production"].includes(envHeader) ? envHeader : "dev"
    ) as Environment

    // Validate API key
    const expectedApiKey = getApiKeyForEnv(env)
    if (!apiKey || apiKey !== expectedApiKey) {
      return Response.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

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
      select: { id: true },
    })

    // Handle geometry fallback: if description has placeholder marker, use subsection's bottom left corner
    let finalGeometry = data.geometry
    if (
      data.type === "AREA" &&
      data.description &&
      data.description.startsWith("‼️ Platzhalter-Geometrie")
    ) {
      // Calculate bottom left corner (minimum longitude and minimum latitude)
      const subsectionGeometry = subsection.geometry as [number, number][]
      if (subsectionGeometry && subsectionGeometry.length > 0) {
        let minLng = subsectionGeometry[0]![0]
        let minLat = subsectionGeometry[0]![1]

        for (const [lng, lat] of subsectionGeometry) {
          if (lng < minLng) minLng = lng
          if (lat < minLat) minLat = lat
        }

        finalGeometry = [minLng, minLat] as [number, number]
      }
    }

    // Prepare data with subsectionId and final geometry
    const subsubsectionData = {
      ...data,
      geometry: finalGeometry,
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
        // @ts-expect-error - m2mFields handling
        data: { ...subsubsectionData, ...connect },
      })
      action = "updated"
    } else {
      // Create
      result = await db.subsubsection.create({
        // @ts-expect-error - m2mFields handling
        data: { ...subsubsectionData, ...connect },
      })
      action = "created"
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
}
