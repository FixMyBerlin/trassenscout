import { sharedColors } from "@/src/core/components/Map/colors/sharedColors"
import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import { LegendItemConfig } from "@/src/core/components/Map/MapLegend"
import { GeometryTypeEnum } from "@prisma/client"

export const legendItemsConfig: Record<string, LegendItemConfig[]> = {
  project: [
    {
      shapes: [GeometryTypeEnum.LINE, GeometryTypeEnum.POLYGON],
      text: "Planungsabschnitte",
      color: subsectionColors.selected,
      dots: true,
    },
    {
      text: "Verlauf ungeklärt",
      color: subsectionColors.selected,
      shape: GeometryTypeEnum.LINE,
      dots: false,
      isDashed: true,
      secondColor: subsectionColors.dashedSecondary,
    },
  ],
  subsection: [
    {
      text: "Eintrag",
      color: subsubsectionColors.current,
      shape: GeometryTypeEnum.LINE,
      dots: true,
    },
    {
      text: "Punktueller Eintrag",
      color: subsubsectionColors.current,
      shape: GeometryTypeEnum.POINT,
    },
    {
      text: "Eintrag (Fläche)",
      color: subsubsectionColors.current,
      shape: GeometryTypeEnum.POLYGON,
    },
    {
      text: "Eintrag - Gestrichelt",
      color: subsubsectionColors.current,
      shape: GeometryTypeEnum.LINE,
      dots: true,
      isDashed: true,
      secondColor: subsubsectionColors.dashedSecondary,
    },
    {
      text: "Ausgewählter Planungsabschnitt",
      color: subsectionColors.selected,
      shape: GeometryTypeEnum.LINE,
    },
    {
      text: "Ausgewählter Planungsabschnitt (Fläche)",
      color: subsectionColors.selected,
      shape: GeometryTypeEnum.POLYGON,
    },
    {
      text: "Andere Planungsabschnitte",
      color: subsectionColors.unselected,
      shape: GeometryTypeEnum.LINE,
    },
    {
      text: "Andere Planungsabschnitte (Fläche)",
      color: subsectionColors.unselected,
      shape: GeometryTypeEnum.POLYGON,
    },
    {
      text: "Planungsabschnitte - Verlauf ungeklärt",
      color: subsectionColors.selected,
      shape: GeometryTypeEnum.LINE,
      isDashed: true,
      secondColor: subsectionColors.dashedSecondary,
    },
  ],
  subsubsection: [
    {
      text: "Ausgewählter Eintrag",
      color: sharedColors.selected,
      shape: GeometryTypeEnum.LINE,
      dots: true,
    },
    {
      text: "Eintrag",
      color: subsubsectionColors.current,
      shape: GeometryTypeEnum.LINE,
      dots: true,
    },
    {
      text: "Ausgewählter Punktueller Eintrag",
      color: sharedColors.selected,
      shape: GeometryTypeEnum.POINT,
    },
    {
      text: "Punktueller Eintrag",
      color: subsubsectionColors.current,
      shape: GeometryTypeEnum.POINT,
    },
    {
      text: "Ausgewählter Eintrag (Fläche)",
      color: sharedColors.selected,
      shape: GeometryTypeEnum.POLYGON,
    },
    {
      text: "Eintrag (Fläche)",
      color: subsubsectionColors.current,
      shape: GeometryTypeEnum.POLYGON,
    },
    {
      text: "Eintrag - Gestrichelt",
      color: subsubsectionColors.current,
      shape: GeometryTypeEnum.LINE,
      dots: true,
      isDashed: true,
      secondColor: subsubsectionColors.dashedSecondary,
    },
    {
      text: "Ausgewählter Planungsabschnitt",
      color: subsectionColors.selected,
      shape: GeometryTypeEnum.LINE,
    },
    {
      text: "Andere Planungsabschnitte",
      color: subsectionColors.unselected,
      shape: GeometryTypeEnum.LINE,
    },
  ],
}
