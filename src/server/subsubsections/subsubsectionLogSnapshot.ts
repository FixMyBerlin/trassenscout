import type {
  GeometryTypeEnum,
  LabelPositionEnum,
  LocationEnum,
  Prisma,
} from "@/src/prisma/generated/browser"
import { relationIds } from "@/src/server/logEntries/create/relationIds"

export const subsubsectionLogSnapshotSelect = {
  slug: true,
  subTitle: true,
  type: true,
  location: true,
  geometry: true,
  labelPos: true,
  lengthM: true,
  width: true,
  widthExisting: true,
  description: true,
  mapillaryKey: true,
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
  revenuesEconomicIncome: true,
  contributionsThirdParties: true,
  grantsOtherFunding: true,
  ownFunds: true,
  qualityLevelId: true,
  managerId: true,
  subsectionId: true,
  subsubsectionStatusId: true,
  subsubsectionTaskId: true,
  subsubsectionInfraId: true,
  extraFields: true,
  specialFeatures: { select: { id: true } },
  SubsubsectionInfrastructureTypes: { select: { id: true } },
} as const

export function subsubsectionLogSnapshot(subsubsection: {
  slug: string
  subTitle: string | null
  type: GeometryTypeEnum
  location: LocationEnum | null
  geometry: Prisma.JsonValue
  labelPos: LabelPositionEnum
  lengthM: number | null
  width: number | null
  widthExisting: number | null
  description: string | null
  mapillaryKey: string | null
  isExistingInfra: boolean | null
  maxSpeed: number | null
  trafficLoad: number | null
  trafficLoadDate: Date | null
  planningPeriod: number | null
  constructionPeriod: number | null
  estimatedCompletionDate: Date | null
  estimatedConstructionDateString: string | null
  costEstimate: number | null
  planningCosts: number | null
  deliveryCosts: number | null
  constructionCosts: number | null
  landAcquisitionCosts: number | null
  expensesOfficialOrders: number | null
  expensesTechnicalVerification: number | null
  nonEligibleExpenses: number | null
  revenuesEconomicIncome: number | null
  contributionsThirdParties: number | null
  grantsOtherFunding: number | null
  ownFunds: number | null
  qualityLevelId: number | null
  managerId: number | null
  subsectionId: number
  subsubsectionStatusId: number | null
  subsubsectionTaskId: number | null
  subsubsectionInfraId: number | null
  extraFields: Prisma.JsonValue
  specialFeatures: { id: number }[]
  SubsubsectionInfrastructureTypes: { id: number }[]
}) {
  return {
    slug: subsubsection.slug,
    subTitle: subsubsection.subTitle,
    type: subsubsection.type,
    location: subsubsection.location,
    geometry: subsubsection.geometry,
    labelPos: subsubsection.labelPos,
    lengthM: subsubsection.lengthM,
    width: subsubsection.width,
    widthExisting: subsubsection.widthExisting,
    description: subsubsection.description,
    mapillaryKey: subsubsection.mapillaryKey,
    isExistingInfra: subsubsection.isExistingInfra,
    maxSpeed: subsubsection.maxSpeed,
    trafficLoad: subsubsection.trafficLoad,
    trafficLoadDate: subsubsection.trafficLoadDate,
    planningPeriod: subsubsection.planningPeriod,
    constructionPeriod: subsubsection.constructionPeriod,
    estimatedCompletionDate: subsubsection.estimatedCompletionDate,
    estimatedConstructionDateString: subsubsection.estimatedConstructionDateString,
    costEstimate: subsubsection.costEstimate,
    planningCosts: subsubsection.planningCosts,
    deliveryCosts: subsubsection.deliveryCosts,
    constructionCosts: subsubsection.constructionCosts,
    landAcquisitionCosts: subsubsection.landAcquisitionCosts,
    expensesOfficialOrders: subsubsection.expensesOfficialOrders,
    expensesTechnicalVerification: subsubsection.expensesTechnicalVerification,
    nonEligibleExpenses: subsubsection.nonEligibleExpenses,
    revenuesEconomicIncome: subsubsection.revenuesEconomicIncome,
    contributionsThirdParties: subsubsection.contributionsThirdParties,
    grantsOtherFunding: subsubsection.grantsOtherFunding,
    ownFunds: subsubsection.ownFunds,
    qualityLevelId: subsubsection.qualityLevelId,
    managerId: subsubsection.managerId,
    subsectionId: subsubsection.subsectionId,
    subsubsectionStatusId: subsubsection.subsubsectionStatusId,
    subsubsectionTaskId: subsubsection.subsubsectionTaskId,
    subsubsectionInfraId: subsubsection.subsubsectionInfraId,
    extraFields: subsubsection.extraFields,
    specialFeatureIds: relationIds(subsubsection.specialFeatures),
    subsubsectionInfrastructureTypeIds: relationIds(subsubsection.SubsubsectionInfrastructureTypes),
  }
}
