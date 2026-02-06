import { layerColors } from "@/src/core/components/Map/layerColors"
import { LegendItemConfig } from "@/src/core/components/Map/MapLegend"
import { GeometryTypeEnum } from "@prisma/client"

export const legendItemsConfig: Record<string, LegendItemConfig[]> = {
  project: [
    { text: "Planungsabschnitte", color: layerColors.selectable, shape: GeometryTypeEnum.LINE, dots: true },
    {
      text: "Planungsabschnitte - Trassenverlauf ungeklärt",
      color: layerColors.selectable,
      shape: GeometryTypeEnum.LINE,
      dots: true,
      isDashed: true,
      secondColor: layerColors.dashedSubsectionSecondary,
    },
    { text: "Planungsabschnitte (Fläche)", color: layerColors.selectable, shape: GeometryTypeEnum.POLYGON },
  ],
  subsection: [
    { text: "Eintrag", color: layerColors.entryDefault, shape: GeometryTypeEnum.LINE, dots: true },
    { text: "Punktueller Eintrag", color: layerColors.entryDefault, shape: GeometryTypeEnum.POINT },
    { text: "Eintrag (Fläche)", color: layerColors.entryDefault, shape: GeometryTypeEnum.POLYGON },
    {
      text: "Eintrag - Gestrichelt",
      color: layerColors.entryDefault,
      shape: GeometryTypeEnum.LINE,
      dots: true,
      isDashed: true,
      secondColor: layerColors.dashedEntrySecondary,
    },
    {
      text: "Ausgewählter Planungsabschnitt",
      color: layerColors.selectedSubsection,
      shape: GeometryTypeEnum.LINE,
    },
    {
      text: "Ausgewählter Planungsabschnitt (Fläche)",
      color: layerColors.selectedSubsection,
      shape: GeometryTypeEnum.POLYGON,
    },
    { text: "Andere Planungsabschnitte", color: layerColors.unselectableSubsection, shape: GeometryTypeEnum.LINE },
    {
      text: "Andere Planungsabschnitte (Fläche)",
      color: layerColors.unselectableSubsection,
      shape: GeometryTypeEnum.POLYGON,
    },
    {
      text: "Planungsabschnitte - Trassenverlauf ungeklärt",
      color: layerColors.selectedSubsection,
      shape: GeometryTypeEnum.LINE,
      isDashed: true,
      secondColor: layerColors.dashedSubsectionSecondary,
    },
  ],
  subsubsection: [
    { text: "Ausgewählter Eintrag", color: layerColors.selected, shape: GeometryTypeEnum.LINE, dots: true },
    { text: "Eintrag", color: layerColors.entryDefault, shape: GeometryTypeEnum.LINE, dots: true },
    { text: "Ausgewählter Punktueller Eintrag", color: layerColors.selected, shape: GeometryTypeEnum.POINT },
    { text: "Punktueller Eintrag", color: layerColors.entryDefault, shape: GeometryTypeEnum.POINT },
    { text: "Ausgewählter Eintrag (Fläche)", color: layerColors.selected, shape: GeometryTypeEnum.POLYGON },
    { text: "Eintrag (Fläche)", color: layerColors.entryDefault, shape: GeometryTypeEnum.POLYGON },
    {
      text: "Eintrag - Gestrichelt",
      color: layerColors.entryDefault,
      shape: GeometryTypeEnum.LINE,
      dots: true,
      isDashed: true,
      secondColor: layerColors.dashedEntrySecondary,
    },
    {
      text: "Ausgewählter Planungsabschnitt",
      color: layerColors.selectedSubsection,
      shape: GeometryTypeEnum.LINE,
    },
    { text: "Andere Planungsabschnitte", color: layerColors.unselectableSubsection, shape: GeometryTypeEnum.LINE },
  ],
}
