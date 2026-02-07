import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import { LegendItemConfig } from "@/src/core/components/Map/MapLegend"
import { GeometryTypeEnum } from "@prisma/client"

export const subsectionLegendConfig: LegendItemConfig[] = [
  {
    shapes: [GeometryTypeEnum.LINE, GeometryTypeEnum.POLYGON],
    text: "Aktueller Planungsabschnitt",
    color: subsectionColors.selected,
    isHull: true,
  },
  {
    shapes: [GeometryTypeEnum.LINE, GeometryTypeEnum.POLYGON],
    text: "Andere Planungsabschnitte",
    color: subsectionColors.unselected,
    isHull: true,
  },
  {
    shapes: [GeometryTypeEnum.LINE, GeometryTypeEnum.POINT, GeometryTypeEnum.POLYGON],
    text: "Eintrag/Maßnahme",
    color: subsubsectionColors.unselected,
  },
  {
    shapes: [GeometryTypeEnum.LINE, GeometryTypeEnum.POINT, GeometryTypeEnum.POLYGON],
    text: "Ausgewählter Eintrag/Maßnahme",
    color: subsubsectionColors.current,
  },
  {
    text: "Eintrag/Maßnahme mit besonderem Status",
    color: subsubsectionColors.unselected,
    shape: GeometryTypeEnum.LINE,
    isDashed: true,
    secondColor: subsubsectionColors.dashedSecondary,
  },
]
