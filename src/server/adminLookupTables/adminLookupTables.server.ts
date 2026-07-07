import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { SurveyResponseTagSchema } from "@/src/server/surveyResponseTags/schemas"
import { deleteSurveyResponseTag } from "@/src/server/surveyResponseTags/surveyResponseTags.server"
import { TagSchema } from "@/src/server/tags/schemas"
import { deleteTag } from "@/src/server/tags/tags.server"
import { AcquisitionAreaStatus } from "@/src/shared/acquisitionAreaStatuses/schemas"
import { NetworkHierarchySchema } from "@/src/shared/networkHierarchy/schemas"
import { OperatorSchema } from "@/src/shared/operators/schemas"
import { QualityLevelSchema } from "@/src/shared/qualityLevels/schemas"
import { SubsectionStatusSchema } from "@/src/shared/subsectionStatus/schemas"
import { SubsubsectionInfra } from "@/src/shared/subsubsectionInfra/schemas"
import { SubsubsectionInfrastructureType } from "@/src/shared/subsubsectionInfrastructureType/schemas"
import { SubsubsectionSpecial } from "@/src/shared/subsubsectionSpecial/schemas"
import { SubsubsectionStatusSchema } from "@/src/shared/subsubsectionStatus/schemas"
import { SubsubsectionTask } from "@/src/shared/subsubsectionTask/schemas"
import {
  CreateLookupRowSchema,
  DeleteLookupRowSchema,
  GetLookupRowSchema,
  GetLookupRowsSchema,
  LookupTableSchema,
  UpdateLookupRowSchema,
} from "./adminLookupTables.inputSchemas"
import { lookupTableConfig } from "./lookupTableConfig"

type LookupTable = z.infer<typeof LookupTableSchema>

function parseLookupData(table: LookupTable, data: unknown) {
  switch (table) {
    case "acquisitionAreaStatuses":
      return AcquisitionAreaStatus.omit({ projectId: true }).parse(data)
    case "networkHierarchies":
      return NetworkHierarchySchema.omit({ projectId: true }).parse(data)
    case "operators":
      return OperatorSchema.omit({ projectId: true }).parse(data)
    case "tags":
      return TagSchema.omit({ projectId: true }).parse(data)
    case "qualityLevels":
      return QualityLevelSchema.omit({ projectId: true }).parse(data)
    case "subsectionStatuses":
      return SubsectionStatusSchema.omit({ projectId: true }).parse(data)
    case "subsubsectionInfras":
      return SubsubsectionInfra.omit({ projectId: true }).parse(data)
    case "subsubsectionInfrastructureTypes":
      return SubsubsectionInfrastructureType.omit({ projectId: true }).parse(data)
    case "subsubsectionSpecials":
      return SubsubsectionSpecial.omit({ projectId: true }).parse(data)
    case "subsubsectionStatuses":
      return SubsubsectionStatusSchema.omit({ projectId: true }).parse(data)
    case "subsubsectionTasks":
      return SubsubsectionTask.omit({ projectId: true }).parse(data)
    case "surveyResponseTags":
      return SurveyResponseTagSchema.omit({ projectId: true }).parse(data)
  }
}

function projectWhere(projectSlug: string, id?: number) {
  return {
    ...(id ? { id } : {}),
    project: { slug: projectSlug },
  }
}

export async function getLookupRowsWithCount(
  headers: Headers,
  input: z.infer<typeof GetLookupRowsSchema>,
) {
  endpointAuth.inherited("auth enforced in getLookupRows")
  const rows = await getLookupRows(headers, input)
  const config = lookupTableConfig[input.table]

  const rowsWithCount = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      [config.countField]: await config.countForRow(input.projectSlug, row.id),
    })),
  )

  const sortedRows =
    input.table === "operators"
      ? [...(rowsWithCount as unknown as Array<{ order: number }>)].sort(
          (a, b) => a.order - b.order,
        )
      : rowsWithCount

  return {
    rows: sortedRows,
    [config.rowsKey]: sortedRows,
    hasMore: false as const,
    count: sortedRows.length,
  }
}

export async function getLookupRows(headers: Headers, input: z.infer<typeof GetLookupRowsSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const where = projectWhere(input.projectSlug)

  switch (input.table) {
    case "acquisitionAreaStatuses":
      return db.acquisitionAreaStatus.findMany({ orderBy: { slug: "asc" }, where })
    case "networkHierarchies":
      return db.networkHierarchy.findMany({ orderBy: { slug: "asc" }, where })
    case "operators":
      return db.operator.findMany({ orderBy: { order: "asc" }, where })
    case "tags":
      return db.tag.findMany({
        orderBy: { title: "asc" },
        where: { ...where, archivedAt: null },
      })
    case "qualityLevels":
      return db.qualityLevel.findMany({ orderBy: { slug: "asc" }, where })
    case "subsectionStatuses":
      return db.subsectionStatus.findMany({ orderBy: { slug: "asc" }, where })
    case "subsubsectionInfras":
      return db.subsubsectionInfra.findMany({ orderBy: { slug: "asc" }, where })
    case "subsubsectionInfrastructureTypes":
      return db.subsubsectionInfrastructureType.findMany({ orderBy: { slug: "asc" }, where })
    case "subsubsectionSpecials":
      return db.subsubsectionSpecial.findMany({ orderBy: { slug: "asc" }, where })
    case "subsubsectionStatuses":
      return db.subsubsectionStatus.findMany({ orderBy: { slug: "asc" }, where })
    case "subsubsectionTasks":
      return db.subsubsectionTask.findMany({ orderBy: { slug: "asc" }, where })
    case "surveyResponseTags":
      return db.surveyResponseTag.findMany({
        orderBy: { title: "asc" },
        where: { ...where, archivedAt: null },
      })
  }
}

export async function getLookupRow(headers: Headers, input: z.infer<typeof GetLookupRowSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const where = projectWhere(input.projectSlug, input.id)

  switch (input.table) {
    case "acquisitionAreaStatuses":
      return db.acquisitionAreaStatus.findFirstOrThrow({ where })
    case "networkHierarchies":
      return db.networkHierarchy.findFirstOrThrow({ where })
    case "operators":
      return db.operator.findFirstOrThrow({ where })
    case "tags":
      return db.tag.findFirstOrThrow({ where })
    case "qualityLevels":
      return db.qualityLevel.findFirstOrThrow({ where })
    case "subsectionStatuses":
      return db.subsectionStatus.findFirstOrThrow({ where })
    case "subsubsectionInfras":
      return db.subsubsectionInfra.findFirstOrThrow({ where })
    case "subsubsectionInfrastructureTypes":
      return db.subsubsectionInfrastructureType.findFirstOrThrow({ where })
    case "subsubsectionSpecials":
      return db.subsubsectionSpecial.findFirstOrThrow({ where })
    case "subsubsectionStatuses":
      return db.subsubsectionStatus.findFirstOrThrow({ where })
    case "subsubsectionTasks":
      return db.subsubsectionTask.findFirstOrThrow({ where })
    case "surveyResponseTags":
      return db.surveyResponseTag.findFirstOrThrow({ where })
  }
}

export async function createLookupRow(
  headers: Headers,
  input: z.infer<typeof CreateLookupRowSchema>,
) {
  const { projectId } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const data = { ...parseLookupData(input.table, input.data), projectId }

  switch (input.table) {
    case "acquisitionAreaStatuses":
      return db.acquisitionAreaStatus.create({ data: data as any })
    case "networkHierarchies":
      return db.networkHierarchy.create({ data: data as any })
    case "operators":
      return db.operator.create({ data: data as any })
    case "tags":
      return db.tag.upsert({
        where: {
          title_projectId: {
            title: (data as { title: string }).title,
            projectId,
          },
        },
        update: {},
        create: data as { title: string; projectId: number },
      })
    case "qualityLevels":
      return db.qualityLevel.create({ data: data as any })
    case "subsectionStatuses":
      return db.subsectionStatus.create({ data: data as any })
    case "subsubsectionInfras":
      return db.subsubsectionInfra.create({ data: data as any })
    case "subsubsectionInfrastructureTypes":
      return db.subsubsectionInfrastructureType.create({ data: data as any })
    case "subsubsectionSpecials":
      return db.subsubsectionSpecial.create({ data: data as any })
    case "subsubsectionStatuses":
      return db.subsubsectionStatus.create({ data: data as any })
    case "subsubsectionTasks":
      return db.subsubsectionTask.create({ data: data as any })
    case "surveyResponseTags":
      return db.surveyResponseTag.upsert({
        where: {
          title_projectId: {
            title: (data as { title: string }).title,
            projectId,
          },
        },
        update: {},
        create: data as { title: string; projectId: number },
      })
  }
}

export async function updateLookupRow(
  headers: Headers,
  input: z.infer<typeof UpdateLookupRowSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const where = projectWhere(input.projectSlug, input.id)
  const data = parseLookupData(input.table, input.data)

  switch (input.table) {
    case "acquisitionAreaStatuses":
      return db.acquisitionAreaStatus.updateMany({ where, data: data as any })
    case "networkHierarchies":
      return db.networkHierarchy.updateMany({ where, data: data as any })
    case "operators":
      return db.operator.updateMany({ where, data: data as any })
    case "tags":
      return db.tag.updateMany({ where, data: data as any })
    case "qualityLevels":
      return db.qualityLevel.updateMany({ where, data: data as any })
    case "subsectionStatuses":
      return db.subsectionStatus.updateMany({ where, data: data as any })
    case "subsubsectionInfras":
      return db.subsubsectionInfra.updateMany({ where, data: data as any })
    case "subsubsectionInfrastructureTypes":
      return db.subsubsectionInfrastructureType.updateMany({ where, data: data as any })
    case "subsubsectionSpecials":
      return db.subsubsectionSpecial.updateMany({ where, data: data as any })
    case "subsubsectionStatuses":
      return db.subsubsectionStatus.updateMany({ where, data: data as any })
    case "subsubsectionTasks":
      return db.subsubsectionTask.updateMany({ where, data: data as any })
    case "surveyResponseTags":
      return db.surveyResponseTag.updateMany({ where, data: data as any })
  }
}

export async function deleteLookupRow(
  headers: Headers,
  input: z.infer<typeof DeleteLookupRowSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const where = projectWhere(input.projectSlug, input.id)

  switch (input.table) {
    case "acquisitionAreaStatuses":
      return db.acquisitionAreaStatus.deleteMany({ where })
    case "networkHierarchies":
      return db.networkHierarchy.deleteMany({ where })
    case "operators":
      return db.operator.deleteMany({ where })
    case "tags":
      return deleteTag(headers, { projectSlug: input.projectSlug, id: input.id })
    case "qualityLevels":
      return db.qualityLevel.deleteMany({ where })
    case "subsectionStatuses":
      return db.subsectionStatus.deleteMany({ where })
    case "subsubsectionInfras":
      return db.subsubsectionInfra.deleteMany({ where })
    case "subsubsectionInfrastructureTypes":
      return db.subsubsectionInfrastructureType.deleteMany({ where })
    case "subsubsectionSpecials":
      return db.subsubsectionSpecial.deleteMany({ where })
    case "subsubsectionStatuses":
      return db.subsubsectionStatus.deleteMany({ where })
    case "subsubsectionTasks":
      return db.subsubsectionTask.deleteMany({ where })
    case "surveyResponseTags":
      return deleteSurveyResponseTag(headers, {
        projectSlug: input.projectSlug,
        id: input.id,
      })
  }
}
