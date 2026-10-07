import type { Feature, FeatureCollection, Geometry } from "geojson"
import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { isImageUpload, isPdf } from "@/src/components/uploads/utils/getFileType"
import type { Prisma } from "@/src/prisma/generated/browser"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"
import {
  loadUserRedactionContext,
  serializeProjectUser,
  type UserRedactionContext,
} from "@/src/server/memberships/redactFormerProjectMemberUser.server"
import { SupportedGeoJsonGeometrySchema } from "@/src/shared/geometry/geojsonSchemas"

/** The allowlist; externalUrl is only read to pick the preview and never sent out. */
const externalShareUploadSelect = {
  id: true,
  title: true,
  mimeType: true,
  createdAt: true,
  externalUrl: true,
} satisfies Prisma.UploadSelect

function toSharedUpload({
  externalUrl,
  ...upload
}: Prisma.UploadGetPayload<{ select: typeof externalShareUploadSelect }>) {
  const file = { mimeType: upload.mimeType, externalUrl }
  const previewKind: "image" | "pdf" | "other" = isImageUpload(file)
    ? "image"
    : isPdf(file)
      ? "pdf"
      : "other"
  return { ...upload, previewKind }
}

/** Every Maßnahme field, minus internal ids (resolved to names) and map-display settings. */
const externalShareSubsubsectionSelect = {
  id: true,
  slug: true,
  subTitle: true,
  location: true,
  description: true,
  lengthM: true,
  width: true,
  widthExisting: true,
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
  mapillaryKey: true,
  extraFields: true,
  createdAt: true,
  updatedAt: true,
  geometry: true,
  subsection: { select: { slug: true, networkHierarchy: { select: { title: true } } } },
  qualityLevel: { select: { title: true } },
  manager: { select: { id: true, firstName: true, lastName: true, institution: true } },
  SubsubsectionStatus: { select: { title: true } },
  SubsubsectionTask: { select: { title: true } },
  SubsubsectionInfra: { select: { title: true } },
  SubsubsectionInfrastructureTypes: { select: { title: true } },
  specialFeatures: { select: { title: true } },
} satisfies Prisma.SubsubsectionSelect

type ExternalShareSubsubsection = Prisma.SubsubsectionGetPayload<{
  select: typeof externalShareSubsubsectionSelect
}>

export async function loadExternalShareContent(projectId: number) {
  const [uploads, subsubsectionCount] = await Promise.all([
    db.upload.findMany({
      where: { projectId, externalShareEnabled: true },
      select: externalShareUploadSelect,
      orderBy: { id: "desc" },
    }),
    db.subsubsection.count({ where: { subsection: { projectId } } }),
  ])
  return { uploads: uploads.map(toSharedUpload), subsubsectionCount }
}

const emptyStringToNull = (record: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, value === "" ? null : value]),
  )

function toFeature(
  subsubsection: ExternalShareSubsubsection,
  redactionContext: UserRedactionContext,
): Feature<Geometry | null> {
  const {
    geometry,
    subsection,
    qualityLevel,
    manager,
    SubsubsectionStatus,
    SubsubsectionTask,
    SubsubsectionInfra,
    SubsubsectionInfrastructureTypes,
    specialFeatures,
    ...fields
  } = subsubsection
  const parsedGeometry = SupportedGeoJsonGeometrySchema.safeParse(geometry)

  return {
    type: "Feature",
    id: subsubsection.id,
    geometry: parsedGeometry.success ? parsedGeometry.data : null,
    properties: {
      ...emptyStringToNull(fields),
      subsection: subsection.slug,
      networkHierarchy: subsection.networkHierarchy?.title ?? null,
      qualityLevel: qualityLevel?.title ?? null,
      status: SubsubsectionStatus?.title ?? null,
      task: SubsubsectionTask?.title ?? null,
      infra: SubsubsectionInfra?.title ?? null,
      infrastructureTypes:
        SubsubsectionInfrastructureTypes.map((type) => type.title).join(", ") || null,
      specialFeatures: specialFeatures.map((special) => special.title).join(", ") || null,
      manager: getFullnameWithInstitution(serializeProjectUser(manager, redactionContext)) ?? null,
    },
  }
}

export async function buildExternalShareGeojson(
  projectId: number,
): Promise<FeatureCollection<Geometry | null>> {
  const [subsubsections, redactionContext] = await Promise.all([
    db.subsubsection.findMany({
      where: { subsection: { projectId } },
      select: externalShareSubsubsectionSelect,
      orderBy: [{ subsection: { order: "asc" } }, { slug: "asc" }],
    }),
    // No viewer behind the link: current members stay named, former members are anonymised.
    loadUserRedactionContext(projectId, UserRoleEnum.USER, 0),
  ])

  return {
    type: "FeatureCollection",
    features: subsubsections.map((subsubsection) => toFeature(subsubsection, redactionContext)),
  }
}
