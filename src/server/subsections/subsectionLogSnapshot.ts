import type { GeometryTypeEnum, LabelPositionEnum, Prisma } from "@/src/prisma/generated/browser"

export const subsectionLogSnapshotSelect = {
  slug: true,
  order: true,
  type: true,
  geometry: true,
  labelPos: true,
  description: true,
  lengthM: true,
  managerId: true,
  operatorId: true,
  networkHierarchyId: true,
  subsectionStatusId: true,
  estimatedCompletionDateString: true,
} as const

export function subsectionLogSnapshot(subsection: {
  slug: string
  order: number
  type: GeometryTypeEnum
  geometry: Prisma.JsonValue
  labelPos: LabelPositionEnum
  description: string | null
  lengthM: number | null
  managerId: number | null
  operatorId: number | null
  networkHierarchyId: number | null
  subsectionStatusId: number | null
  estimatedCompletionDateString: string | null
}) {
  return {
    slug: subsection.slug,
    order: subsection.order,
    type: subsection.type,
    geometry: subsection.geometry,
    labelPos: subsection.labelPos,
    description: subsection.description,
    lengthM: subsection.lengthM,
    managerId: subsection.managerId,
    operatorId: subsection.operatorId,
    networkHierarchyId: subsection.networkHierarchyId,
    subsectionStatusId: subsection.subsectionStatusId,
    estimatedCompletionDateString: subsection.estimatedCompletionDateString,
  }
}
