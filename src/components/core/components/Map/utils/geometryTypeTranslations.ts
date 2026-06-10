import { GeometryTypeEnum } from "@/src/prisma/generated/browser"

export const GEOMETRY_TYPE_TOOLTIPS: Record<GeometryTypeEnum, string> = {
  POINT: "Punkt",
  LINE: "Linie",
  POLYGON: "Polygon",
} as const
