import { LocationEnum } from "@/src/prisma/generated/browser"

export const subsubsectionLocationLabelMap: Record<keyof typeof LocationEnum, string> = {
  URBAN: "innerorts",
  RURAL: "außerorts",
} as const
