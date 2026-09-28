import { SubsubsectionStatusStyleEnum } from "@/src/prisma/generated/client"

export type CatalogKey =
  | "operators"
  | "subsubsectionInfras"
  | "subsubsectionStatuses"
  | "subsubsectionTasks"

export type CatalogConfig = {
  key: CatalogKey
  label: string
  model: "operator" | "subsubsectionInfra" | "subsubsectionStatus" | "subsubsectionTask"
  hasStyle: boolean
  routeSegment: string
}

export const catalogConfigs: Record<CatalogKey, CatalogConfig> = {
  operators: {
    key: "operators",
    label: "Baulastträger",
    model: "operator",
    hasStyle: false,
    routeSegment: "operators",
  },
  subsubsectionInfras: {
    key: "subsubsectionInfras",
    label: "Führungsform (RVA)",
    model: "subsubsectionInfra",
    hasStyle: false,
    routeSegment: "subsubsection-infra",
  },
  subsubsectionStatuses: {
    key: "subsubsectionStatuses",
    label: "Phase",
    model: "subsubsectionStatus",
    hasStyle: true,
    routeSegment: "subsubsection-status",
  },
  subsubsectionTasks: {
    key: "subsubsectionTasks",
    label: "Maßnahmentyp",
    model: "subsubsectionTask",
    hasStyle: false,
    routeSegment: "subsubsection-task",
  },
}

export const statusStyles = [
  SubsubsectionStatusStyleEnum.REGULAR,
  SubsubsectionStatusStyleEnum.GREEN,
] as const
