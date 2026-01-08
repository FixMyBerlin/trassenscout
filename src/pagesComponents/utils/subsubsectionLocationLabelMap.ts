import { LocationEnum } from "@prisma/client"

export const subsubsectionLocationLabelMap: Record<keyof typeof LocationEnum, string> = {
  URBAN: "innerorts",
  RURAL: "außerorts",
} as const
