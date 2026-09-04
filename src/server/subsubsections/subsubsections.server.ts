import { z } from "zod"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { shortTitle } from "@/src/components/core/components/text/titles"
import type { Prisma } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { deleteSubsubsectionMcpCreateDraftBySlug } from "@/src/server/mcp/mcpDrafts/mcpDrafts.server"
import {
  formerMemberFk,
  loadUserRedactionContext,
  serializeProjectUser,
} from "@/src/server/memberships/redactFormerProjectMemberUser.server"
import { connectIds, idsFromFormValue, setIds } from "@/src/shared/prisma/connectIds"
import {
  parseDefinitions,
  sanitizeExtraFieldsForSave,
} from "@/src/shared/subsubsections/extraFieldSchemas"
import { SubsubsectionSchema } from "@/src/shared/subsubsections/schemas"
import { m2mFieldRelationNames, m2mFields } from "./m2mFields"
import {
  subsubsectionLogSnapshot,
  subsubsectionLogSnapshotSelect,
} from "./subsubsectionLogSnapshot"
import {
  CreateSubsubsectionSchema,
  DeleteSubsubsectionSchema,
  GetSubsubsectionBySlugSchema,
  GetSubsubsectionSchema,
  GetSubsubsectionsSchema,
  UpdateSubsubsectionSchema,
} from "./subsubsections.inputSchemas"
import type { SubsubsectionWithPosition } from "./types"
import { typeSubsubsectionGeometry } from "./utils/typeSubsubsectionGeometry"

const subsubsectionListInclude = {
  manager: { select: { id: true, firstName: true, lastName: true } },
  subsection: { select: { id: true, slug: true } },
  qualityLevel: { select: { title: true, slug: true, url: true } },
  SubsubsectionTask: { select: { title: true } },
  SubsubsectionInfrastructureTypes: { select: { id: true, title: true, slug: true } },
  SubsubsectionStatus: { select: { title: true, slug: true, style: true } },
  SubsubsectionInfra: { select: { title: true, slug: true } },
  specialFeatures: { select: { id: true, title: true } },
} as const

const subsubsectionDetailInclude = {
  ...subsubsectionListInclude,
  subsection: {
    select: {
      slug: true,
      project: {
        select: {
          landAcquisitionModuleEnabled: true,
          subsubsectionExtraFieldDefinitions: true,
        },
      },
    },
  },
  ...Object.fromEntries(
    m2mFields.map((fieldName) => [
      m2mFieldRelationNames[fieldName],
      { select: { id: true, title: true, slug: true } },
    ]),
  ),
} as const

type SubsubsectionInput = z.infer<typeof SubsubsectionSchema>

async function getProjectExtraFieldDefinitions(projectSlug: string) {
  const project = await db.project.findFirstOrThrow({
    where: { slug: projectSlug },
    select: { subsubsectionExtraFieldDefinitions: true },
  })

  return parseDefinitions(project.subsubsectionExtraFieldDefinitions)
}

async function subsubsectionExtraFieldsData(
  projectSlug: string,
  extraFields: SubsubsectionInput["extraFields"],
) {
  const definitions = await getProjectExtraFieldDefinitions(projectSlug)
  return sanitizeExtraFieldsForSave(extraFields, definitions) as Prisma.InputJsonValue
}

function subsubsectionInProjectWhere(projectSlug: string, id: number) {
  return { id, subsection: { project: { slug: projectSlug } } }
}

async function validateSubsubsectionRelations(projectSlug: string, input: SubsubsectionInput) {
  const infrastructureTypeIds = idsFromFormValue(input.subsubsectionInfrastructureTypeIds)
  const specialFeatureIds = idsFromFormValue(input.specialFeatures)

  await Promise.all([
    db.subsection.findFirstOrThrow({
      where: { id: input.subsectionId, project: { slug: projectSlug } },
      select: { id: true },
    }),
    input.qualityLevelId
      ? db.qualityLevel.findFirstOrThrow({
          where: { id: input.qualityLevelId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
    input.subsubsectionStatusId
      ? db.subsubsectionStatus.findFirstOrThrow({
          where: { id: input.subsubsectionStatusId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
    input.subsubsectionTaskId
      ? db.subsubsectionTask.findFirstOrThrow({
          where: { id: input.subsubsectionTaskId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
    input.subsubsectionInfraId
      ? db.subsubsectionInfra.findFirstOrThrow({
          where: { id: input.subsubsectionInfraId, project: { slug: projectSlug } },
          select: { id: true },
        })
      : undefined,
    infrastructureTypeIds.length
      ? db.subsubsectionInfrastructureType
          .findMany({
            where: { id: { in: infrastructureTypeIds }, project: { slug: projectSlug } },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== infrastructureTypeIds.length)
              throw new Error("Invalid infrastructure type")
          })
      : undefined,
    specialFeatureIds.length
      ? db.subsubsectionSpecial
          .findMany({
            where: { id: { in: specialFeatureIds }, project: { slug: projectSlug } },
            select: { id: true },
          })
          .then((records) => {
            if (records.length !== specialFeatureIds.length)
              throw new Error("Invalid special feature")
          })
      : undefined,
  ])
}

function subsubsectionData(input: SubsubsectionInput, extraFields: Prisma.InputJsonValue) {
  const {
    specialFeatures,
    subsubsectionInfrastructureTypeIds,
    extraFields: _extraFields,
    ...data
  } = input

  return {
    ...data,
    geometry: data.geometry as Prisma.InputJsonValue,
    extraFields,
    specialFeatures: connectIds(idsFromFormValue(specialFeatures)),
    SubsubsectionInfrastructureTypes: connectIds(
      idsFromFormValue(subsubsectionInfrastructureTypeIds),
    ),
  }
}

function subsubsectionUpdateData(input: SubsubsectionInput, extraFields: Prisma.InputJsonValue) {
  const {
    specialFeatures,
    subsubsectionInfrastructureTypeIds,
    extraFields: _extraFields,
    ...data
  } = input

  return {
    ...data,
    geometry: data.geometry as Prisma.InputJsonValue,
    extraFields,
    specialFeatures: setIds(idsFromFormValue(specialFeatures)),
    SubsubsectionInfrastructureTypes: setIds(idsFromFormValue(subsubsectionInfrastructureTypeIds)),
  }
}

export async function getSubsubsections(
  headers: Headers,
  input: z.infer<typeof GetSubsubsectionsSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const subsubsections = await db.subsubsection.findMany({
    orderBy: { slug: "asc" },
    where: {
      subsection: {
        project: { slug: input.projectSlug },
        ...(input.subsectionId ? { id: input.subsectionId } : {}),
      },
    },
    include: subsubsectionListInclude,
  })
  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )

  return subsubsections.map((subsubsection) => {
    const typed = typeSubsubsectionGeometry(subsubsection) as unknown as SubsubsectionWithPosition
    return {
      ...typed,
      manager: serializeProjectUser(subsubsection.manager, redactionContext),
      managerId: formerMemberFk(subsubsection.managerId, redactionContext),
    }
  })
}

export async function getSubsubsection(
  headers: Headers,
  input: z.infer<typeof GetSubsubsectionSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const subsubsection = await db.subsubsection.findFirstOrThrow({
    where: subsubsectionInProjectWhere(input.projectSlug, input.id),
    include: subsubsectionDetailInclude,
  })
  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  const typed = typeSubsubsectionGeometry(subsubsection) as SubsubsectionWithPosition

  return {
    ...typed,
    manager: serializeProjectUser(subsubsection.manager, redactionContext),
    managerId: formerMemberFk(subsubsection.managerId, redactionContext),
  }
}

export async function getSubsubsectionBySlug(
  headers: Headers,
  input: z.infer<typeof GetSubsubsectionBySlugSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const subsubsection = await db.subsubsection.findFirstOrThrow({
    where: {
      slug: input.subsubsectionSlug,
      subsection: {
        slug: input.subsectionSlug,
        project: { slug: input.projectSlug },
      },
    },
    include: subsubsectionDetailInclude,
  })
  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  const typed = typeSubsubsectionGeometry(subsubsection) as SubsubsectionWithPosition

  return {
    ...typed,
    manager: serializeProjectUser(subsubsection.manager, redactionContext),
    managerId: formerMemberFk(subsubsection.managerId, redactionContext),
  }
}

export async function createSubsubsection(
  headers: Headers,
  input: z.infer<typeof CreateSubsubsectionSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
  )
  const { projectSlug, ...data } = input
  await validateSubsubsectionRelations(projectSlug, data)
  const extraFields = await subsubsectionExtraFieldsData(projectSlug, data.extraFields)

  const record = await db.subsubsection.create({
    data: subsubsectionData(data, extraFields),
    include: { manager: subsubsectionListInclude.manager },
  })

  await deleteSubsubsectionMcpCreateDraftBySlug(record.subsectionId, record.slug)

  await createLogEntry({
    action: "CREATE",
    message: `Neue Maßnahme ${frenchQuote(shortTitle(record.slug))} wurde erstellt.`,
    userId: Number(session.userId),
    projectSlug,
    subsubsectionId: record.id,
    updatedRecord: {
      id: record.id,
      slug: record.slug,
      subTitle: record.subTitle,
      type: record.type,
      location: record.location,
      geometry: record.geometry,
      labelPos: record.labelPos,
      lengthM: record.lengthM,
      width: record.width,
      widthExisting: record.widthExisting,
      description: record.description,
      mapillaryKey: record.mapillaryKey,
      isExistingInfra: record.isExistingInfra,
      maxSpeed: record.maxSpeed,
      trafficLoad: record.trafficLoad,
      trafficLoadDate: record.trafficLoadDate,
      planningPeriod: record.planningPeriod,
      constructionPeriod: record.constructionPeriod,
      estimatedCompletionDate: record.estimatedCompletionDate,
      estimatedConstructionDateString: record.estimatedConstructionDateString,
      costEstimate: record.costEstimate,
      planningCosts: record.planningCosts,
      deliveryCosts: record.deliveryCosts,
      constructionCosts: record.constructionCosts,
      landAcquisitionCosts: record.landAcquisitionCosts,
      expensesOfficialOrders: record.expensesOfficialOrders,
      expensesTechnicalVerification: record.expensesTechnicalVerification,
      nonEligibleExpenses: record.nonEligibleExpenses,
      revenuesEconomicIncome: record.revenuesEconomicIncome,
      contributionsThirdParties: record.contributionsThirdParties,
      grantsOtherFunding: record.grantsOtherFunding,
      ownFunds: record.ownFunds,
      qualityLevelId: record.qualityLevelId,
      managerId: record.managerId,
      subsectionId: record.subsectionId,
      subsubsectionStatusId: record.subsubsectionStatusId,
      subsubsectionTaskId: record.subsubsectionTaskId,
      subsubsectionInfraId: record.subsubsectionInfraId,
      extraFields: record.extraFields,
      specialFeatureIds: idsFromFormValue(data.specialFeatures),
      subsubsectionInfrastructureTypeIds: idsFromFormValue(data.subsubsectionInfrastructureTypeIds),
    },
  })

  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  return {
    ...record,
    manager: serializeProjectUser(record.manager, redactionContext),
    managerId: formerMemberFk(record.managerId, redactionContext),
  }
}

export async function updateSubsubsection(
  headers: Headers,
  input: z.infer<typeof UpdateSubsubsectionSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
  )
  const { id, projectSlug, ...data } = input
  await validateSubsubsectionRelations(projectSlug, data)
  const previous = await db.subsubsection.findFirstOrThrow({
    where: subsubsectionInProjectWhere(projectSlug, id),
    select: { id: true, ...subsubsectionLogSnapshotSelect },
  })

  if (data.subsectionId !== previous.subsectionId) {
    await endpointAuth.admin(headers)
  }

  const extraFields = await subsubsectionExtraFieldsData(projectSlug, data.extraFields)

  const record = await db.subsubsection.update({
    where: { id: previous.id },
    data: subsubsectionUpdateData(data, extraFields),
    include: {
      subsection: { select: { slug: true } },
      specialFeatures: { select: { id: true } },
      SubsubsectionInfrastructureTypes: { select: { id: true } },
      manager: subsubsectionListInclude.manager,
    },
  })

  await createLogEntry({
    action: "UPDATE",
    message: `Maßnahme ${frenchQuote(shortTitle(record.slug))} wurde bearbeitet.`,
    userId: Number(session.userId),
    projectSlug,
    subsubsectionId: record.id,
    previousRecord: {
      id: previous.id,
      ...subsubsectionLogSnapshot(previous),
    },
    updatedRecord: {
      id: record.id,
      ...subsubsectionLogSnapshot(record),
    },
  })

  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  return {
    ...record,
    manager: serializeProjectUser(record.manager, redactionContext),
    managerId: formerMemberFk(record.managerId, redactionContext),
  }
}

export async function deleteSubsubsection(
  headers: Headers,
  input: z.infer<typeof DeleteSubsubsectionSchema>,
) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const previous = await db.subsubsection.findFirst({
    where: subsubsectionInProjectWhere(input.projectSlug, input.id),
    select: { id: true, slug: true },
  })
  const result = await db.subsubsection.deleteMany({
    where: subsubsectionInProjectWhere(input.projectSlug, input.id),
  })

  if (previous) {
    await createLogEntry({
      action: "DELETE",
      message: `Maßnahme ${frenchQuote(shortTitle(previous.slug))} wurde gelöscht.`,
      userId: Number(session.userId),
      projectSlug: input.projectSlug,
      previousRecord: { id: previous.id },
    })
  }

  return result
}
