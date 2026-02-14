import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { LegendItemConfig } from "@/src/core/components/Map/MapLegend"
import { GeometryTypeEnum } from "@prisma/client"

export const projectLegendConfig: LegendItemConfig[] = [
  {
    shapes: [GeometryTypeEnum.LINE, GeometryTypeEnum.POLYGON],
    text: "Planungsabschnitte",
    color: subsectionColors.hull.current,
    dots: true,
  },
  {
    text: "Verlauf ungeklärt",
    color: subsectionColors.hull.current,
    shape: GeometryTypeEnum.LINE,
    dots: false,
    isDashed: true,
    secondColor: subsectionColors.line.dashedSecondary,
  },
]
