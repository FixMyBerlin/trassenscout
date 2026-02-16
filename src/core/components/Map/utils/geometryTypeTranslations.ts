import { GeometryTypeEnum } from "@prisma/client"

export const GEOMETRY_TYPE_TOOLTIPS: Record<GeometryTypeEnum, string> = {
  POINT: "Punkt",
  LINE: "Linie",
  POLYGON: "Polygon",
} as const
