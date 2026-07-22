import type { LabelPositionEnum } from "@/src/prisma/generated/browser"
import type { GeometryByGeometryType } from "@/src/shared/geometry/geometrySchemas"

export type SubsectionMapEntity =
  | {
      id: number
      slug: string
      type: "LINE"
      geometry: GeometryByGeometryType<"LINE">
      labelPos: LabelPositionEnum
      SubsectionStatus?: { style: "REGULAR" | "DASHED" } | null
    }
  | {
      id: number
      slug: string
      type: "POLYGON"
      geometry: GeometryByGeometryType<"POLYGON">
      labelPos: LabelPositionEnum
      SubsectionStatus?: { style: "REGULAR" | "DASHED" } | null
    }

export type SubsectionMapEntities = SubsectionMapEntity[]

export type SubsubsectionMapEntity =
  | {
      id: number
      subsectionId: number
      slug: string
      type: "POINT"
      geometry: GeometryByGeometryType<"POINT">
      labelPos: LabelPositionEnum
      subsection: { slug: string }
      SubsubsectionStatus?: { style: string } | null
      SubsubsectionTask?: { title?: string | null } | null
    }
  | {
      id: number
      subsectionId: number
      slug: string
      type: "LINE"
      geometry: GeometryByGeometryType<"LINE">
      labelPos: LabelPositionEnum
      subsection: { slug: string }
      SubsubsectionStatus?: { style: string } | null
      SubsubsectionTask?: { title?: string | null } | null
    }
  | {
      id: number
      subsectionId: number
      slug: string
      type: "POLYGON"
      geometry: GeometryByGeometryType<"POLYGON">
      labelPos: LabelPositionEnum
      subsection: { slug: string }
      SubsubsectionStatus?: { style: string } | null
      SubsubsectionTask?: { title?: string | null } | null
    }
