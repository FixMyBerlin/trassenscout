import { z } from "zod"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { shortTitle } from "@/src/components/core/components/text/titles"
import type { MembershipRoleEnum } from "@/src/prisma/generated/browser"
import { Prisma } from "@/src/prisma/generated/client"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { deleteSubsubsectionMcpCreateDraftBySlug } from "@/src/server/mcp/mcpDrafts/mcpDrafts.server"
import {
  formerMemberFk,
  loadUserRedactionContext,
  serializeProjectUser,
  type UserRedactionContext,
} from "@/src/server/memberships/redactFormerProjectMemberUser.server"
import { projectRecordListVisibilityWhere } from "@/src/server/projectRecords/projectRecordVisibility.server"
import { addSubsubsectionBookmarks } from "@/src/server/subsubsectionBookmarks/recordSubsubsectionActivity.server"
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

export const subsubsectionListRowInclude = {
  ...subsubsectionListInclude,
  _count: { select: { uploads: true } },
} as const

type SubsubsectionListQueryRow = Prisma.SubsubsectionGetPayload<{
  include: typeof subsubsectionListRowInclude
}>

// Distributive, so the `type`/`geometry` union of `SubsubsectionWithPosition` stays intact.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

type SubsubsectionListRowBase = DistributiveOmit<SubsubsectionWithPosition, "subsection">

export type SubsubsectionListRow = SubsubsectionListRowBase & {
  subsection: { id: number; slug: string }
  uploadCount: number
  /** Protokolle the current user sees in the Maßnahme's Protokoll list. */
  projectRecordCount: number
}

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

// No geometry is stored as SQL NULL; JSON null would fail the type/geometry check
function geometryData({ type, geometry }: Pick<SubsubsectionInput, "type" | "geometry">) {
  return geometry === null
    ? { type: null, geometry: Prisma.DbNull }
    : { type, geometry: geometry as Prisma.InputJsonValue }
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
    ...geometryData(data),
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
    ...geometryData(data),
    extraFields,
    specialFeatures: setIds(idsFromFormValue(specialFeatures)),
    SubsubsectionInfrastructureTypes: setIds(idsFromFormValue(subsubsectionInfrastructureTypeIds)),
  }
}

export type ProjectRecordVisibilityScope = {
  projectId: number
  aiEnabled: boolean
  /** Null for global admins. */
  membershipRole: MembershipRoleEnum | null
}

/**
 * Number of Protokolle per Maßnahme, as the current user sees them in the Maßnahme's Protokoll list
 * (`getProjectRecordsBySubsubsection`): linked directly or via the m2n relation, same visibility
 * filter. One query for all Maßnahmen; a record linked both ways counts once.
 */
export async function countVisibleProjectRecordsBySubsubsection(
  subsubsectionIds: number[],
  scopes: ProjectRecordVisibilityScope[],
) {
  const counts = new Map<number, number>()
  if (subsubsectionIds.length === 0 || scopes.length === 0) return counts

  const projectRecords = await db.projectRecord.findMany({
    where: {
      OR: scopes.map(({ projectId, aiEnabled, membershipRole }) => ({
        projectId,
        ...projectRecordListVisibilityWhere(aiEnabled, membershipRole),
      })),
      AND: [
        {
          OR: [
            { subsubsectionId: { in: subsubsectionIds } },
            { subsubsections: { some: { id: { in: subsubsectionIds } } } },
          ],
        },
      ],
    },
    select: {
      subsubsectionId: true,
      subsubsections: { where: { id: { in: subsubsectionIds } }, select: { id: true } },
    },
  })

  const wanted = new Set(subsubsectionIds)
  for (const record of projectRecords) {
    const linked = new Set(record.subsubsections.map(({ id }) => id))
    if (record.subsubsectionId !== null && wanted.has(record.subsubsectionId)) {
      linked.add(record.subsubsectionId)
    }
    for (const id of linked) counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}

/** Who created or last edited a Maßnahme is stored, but not sent to the client. */
function omitAuditUserIds<T extends { createdById: number | null; updatedById: number | null }>(
  row: T,
) {
  const { createdById: _createdById, updatedById: _updatedById, ...rest } = row
  return rest
}

export function mapSubsubsectionListRows<Row extends SubsubsectionListQueryRow>(
  rows: Row[],
  {
    redactionContextFor,
    projectRecordCounts,
  }: {
    redactionContextFor: (row: Row) => UserRedactionContext
    projectRecordCounts: Map<number, number>
  },
): SubsubsectionListRow[] {
  return rows.map((row) => {
    const redactionContext = redactionContextFor(row)
    const { _count, ...rest } = omitAuditUserIds(row)
    // Same optimistic geometry typing as in `getSubsubsection`.
    const typed = typeSubsubsectionGeometry(rest) as typeof rest & SubsubsectionListRowBase
    return {
      ...typed,
      manager: serializeProjectUser(row.manager, redactionContext),
      managerId: formerMemberFk(row.managerId, redactionContext),
      uploadCount: _count.uploads,
      projectRecordCount: projectRecordCounts.get(row.id) ?? 0,
    }
  })
}

export async function getSubsubsections(
  headers: Headers,
  input: z.infer<typeof GetSubsubsectionsSchema>,
) {
  const { projectId, session, membershipRole } = await endpointAuth.projectRole(
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
    include: subsubsectionListRowInclude,
  })
  const [redactionContext, project] = await Promise.all([
    loadUserRedactionContext(projectId, session.role, Number(session.userId)),
    db.project.findUnique({ where: { id: projectId }, select: { aiEnabled: true } }),
  ])
  const projectRecordCounts = await countVisibleProjectRecordsBySubsubsection(
    subsubsections.map(({ id }) => id),
    [{ projectId, aiEnabled: project?.aiEnabled ?? false, membershipRole }],
  )

  return mapSubsubsectionListRows(subsubsections, {
    redactionContextFor: () => redactionContext,
    projectRecordCounts,
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
  const typed = typeSubsubsectionGeometry(
    omitAuditUserIds(subsubsection),
  ) as SubsubsectionWithPosition

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
  const typed = typeSubsubsectionGeometry(
    omitAuditUserIds(subsubsection),
  ) as SubsubsectionWithPosition

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
  const userId = Number(session.userId)
  await validateSubsubsectionRelations(projectSlug, data)
  const extraFields = await subsubsectionExtraFieldsData(projectSlug, data.extraFields)

  const record = await db.subsubsection.create({
    data: { ...subsubsectionData(data, extraFields), createdById: userId, updatedById: userId },
    include: { manager: subsubsectionListInclude.manager },
  })

  await deleteSubsubsectionMcpCreateDraftBySlug(record.subsectionId, record.slug)

  await addSubsubsectionBookmarks({
    subsubsectionIds: [record.id],
    userIds: [userId, record.managerId],
  })

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
      grantAmount: record.grantAmount,
      ownFunds: record.ownFunds,
      grantsOtherFunding: record.grantsOtherFunding,
      revenuesEconomicIncome: record.revenuesEconomicIncome,
      contributionsThirdParties: record.contributionsThirdParties,
      remainingFunding: record.remainingFunding,
      disbursedFunding: record.disbursedFunding,
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
    ...omitAuditUserIds(record),
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
  const userId = Number(session.userId)
  await validateSubsubsectionRelations(projectSlug, data)
  const previous = await db.subsubsection.findFirstOrThrow({
    where: subsubsectionInProjectWhere(projectSlug, id),
    select: { id: true, ...subsubsectionLogSnapshotSelect },
  })

  if (data.subsectionId !== previous.subsectionId) {
    await endpointAuth.admin(headers)
  }

  if (data.geometry === null && previous.geometry !== null) {
    const acquisitionAreaCount = await db.acquisitionArea.count({
      where: { subsubsectionId: previous.id },
    })
    if (acquisitionAreaCount > 0) {
      throw new Error(
        "Die Geometrie kann nicht entfernt werden, solange die Maßnahme Verhandlungsflächen hat.",
      )
    }
  }

  const extraFields = await subsubsectionExtraFieldsData(projectSlug, data.extraFields)

  const record = await db.subsubsection.update({
    where: { id: previous.id },
    data: { ...subsubsectionUpdateData(data, extraFields), updatedById: userId },
    include: {
      subsection: { select: { slug: true } },
      specialFeatures: { select: { id: true } },
      SubsubsectionInfrastructureTypes: { select: { id: true } },
      manager: subsubsectionListInclude.manager,
    },
  })

  // The previous manager keeps their bookmark.
  await addSubsubsectionBookmarks({
    subsubsectionIds: [record.id],
    userIds: [userId, record.managerId !== previous.managerId ? record.managerId : null],
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
    ...omitAuditUserIds(record),
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
