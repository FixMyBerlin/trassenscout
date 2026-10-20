import type { Prisma } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"
import {
  MCP_GEOMETRY_MAX_ITEMS,
  mcpListResult,
  resolveMcpListLimit,
} from "@/src/server/mcp/mcpListLimit.const"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"
import { buildSubsubsectionUrl } from "@/src/server/mcp/subsubsectionUrl"

type ListSubsubsectionsForMcpInput = {
  projectSlug: string
  subsectionSlug?: string
  origin: string
  limit?: number
  offset?: number
  includeFields?: boolean
  includeGeometry?: boolean
}

const detailSelect = {
  slug: true,
  description: true,
  type: true,
  location: true,
  lengthM: true,
  width: true,
  isExistingInfra: true,
  maxSpeed: true,
  trafficLoad: true,
  trafficLoadDate: true,
  planningPeriod: true,
  constructionPeriod: true,
  estimatedCompletionDate: true,
  estimatedConstructionDateString: true,
  costEstimate: true,
  planningCosts: true,
  deliveryCosts: true,
  constructionCosts: true,
  landAcquisitionCosts: true,
  expensesOfficialOrders: true,
  expensesTechnicalVerification: true,
  nonEligibleExpenses: true,
  grantAmount: true,
  ownFunds: true,
  grantsOtherFunding: true,
  revenuesEconomicIncome: true,
  contributionsThirdParties: true,
  remainingFunding: true,
  disbursedFunding: true,
  extraFields: true,
  qualityLevel: { select: { slug: true } },
  SubsubsectionStatus: { select: { slug: true } },
  SubsubsectionTask: { select: { slug: true } },
  SubsubsectionInfra: { select: { slug: true } },
  SubsubsectionInfrastructureTypes: { select: { slug: true } },
  subsection: { select: { slug: true } },
  _count: {
    select: { projectRecords: true, uploads: true, acquisitionAreas: true },
  },
} as const

type DetailRow = Prisma.SubsubsectionGetPayload<{ select: typeof detailSelect }>

function detailFields(row: DetailRow) {
  const {
    qualityLevel,
    SubsubsectionStatus,
    SubsubsectionTask,
    SubsubsectionInfra,
    SubsubsectionInfrastructureTypes,
    slug: _slug,
    description: _description,
    subsection: _subsection,
    _count,
    ...fields
  } = row
  return {
    ...fields,
    qualityLevelSlug: qualityLevel?.slug ?? null,
    subsubsectionStatusSlug: SubsubsectionStatus?.slug ?? null,
    subsubsectionTaskSlug: SubsubsectionTask?.slug ?? null,
    subsubsectionInfraSlug: SubsubsectionInfra?.slug ?? null,
    subsubsectionInfrastructureTypeSlugs: SubsubsectionInfrastructureTypes.map((t) => t.slug),
    projectRecordCount: _count.projectRecords,
    uploadCount: _count.uploads,
    acquisitionAreaCount: _count.acquisitionAreas,
  }
}

export async function listSubsubsectionsForMcp({
  projectSlug,
  subsectionSlug,
  origin,
  limit: limitInput,
  offset = 0,
  includeFields,
  includeGeometry,
}: ListSubsubsectionsForMcpInput) {
  const withDetails = Boolean(includeFields || includeGeometry)
  // Complete geometries are large, so that variant takes fewer rows per call
  const limit = Math.min(
    resolveMcpListLimit(limitInput),
    includeGeometry ? MCP_GEOMETRY_MAX_ITEMS : Number.POSITIVE_INFINITY,
  )
  const project = await requireMcpEnabledProject(projectSlug)

  const subsubsections = await db.subsubsection.findMany({
    where: {
      subsection: {
        projectId: project.id,
        ...(subsectionSlug ? { slug: subsectionSlug } : {}),
      },
    },
    orderBy: [{ subsection: { slug: "asc" } }, { slug: "asc" }],
    skip: offset,
    take: limit + 1,
    select: withDetails
      ? { ...detailSelect, ...(includeGeometry ? { geometry: true } : {}) }
      : {
          slug: true,
          description: true,
          type: true,
          subsection: { select: { slug: true } },
        },
  })

  const { limit: appliedLimit, returned, truncated, items } = mcpListResult(subsubsections, limit)

  return {
    limit: appliedLimit,
    offset,
    returned,
    truncated,
    nextOffset: truncated ? offset + returned : null,
    disambiguationRequired: Boolean(subsectionSlug) && returned > 1,
    subsubsections: items.map((subsubsection) => ({
      projectSlug: project.slug,
      subsectionSlug: subsubsection.subsection.slug,
      slug: subsubsection.slug,
      description: subsubsection.description,
      hasGeometry: subsubsection.type !== null,
      ...(withDetails ? detailFields(subsubsection as DetailRow) : {}),
      url: buildSubsubsectionUrl(
        origin,
        project.slug,
        subsubsection.subsection.slug,
        subsubsection.slug,
      ),
    })),
  }
}
