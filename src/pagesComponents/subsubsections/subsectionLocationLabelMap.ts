import { LocationEnum } from "@prisma/client"

export const subsectionLocationLabelMap: Record<keyof typeof LocationEnum, string> = {
  URBAN: "innerorts",
  RURAL: "außerorts",
} as const
