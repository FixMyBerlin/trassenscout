import type {
  QualityLevel,
  Subsubsection,
  SubsubsectionStatusStyleEnum,
} from "@/src/prisma/generated/client"
import type { GeometryWithTypeDiscriminated } from "@/src/shared/geometry/geometrySchemas"
import type { getSubsubsections } from "./subsubsections.server"

export type SubsubsectionWithPosition = Omit<Subsubsection, "geometry" | "type"> &
  GeometryWithTypeDiscriminated & {
    manager: { firstName: string; lastName: string } | null
  } & { subsection: { slug: string; project: { landAcquisitionModuleEnabled: boolean } } } & {
    qualityLevel?: Pick<QualityLevel, "title" | "slug" | "url"> | null
  } & { SubsubsectionTask?: { title: string } | null } & {
    SubsubsectionInfrastructureTypes: { id: number; title: string; slug: string }[]
  } & {
    SubsubsectionStatus?: {
      title: string
      slug: string
      style: SubsubsectionStatusStyleEnum
    } | null
  } & {
    SubsubsectionInfra?: { title: string; slug: string } | null
  } & { specialFeatures: { id: number; title: string }[] }

export type SubsubsectionsList = Awaited<ReturnType<typeof getSubsubsections>>
