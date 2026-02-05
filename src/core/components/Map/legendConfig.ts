import { layerColors } from "@/src/core/components/Map/layerColors"
import { LegendItemConfig } from "@/src/core/components/Map/MapLegend"

export const legendItemsConfig: Record<string, LegendItemConfig[]> = {
  project: [
    { text: "Planungsabschnitte", color: layerColors.selectable, shape: "line", dots: true },
    {
      text: "Planungsabschnitte - Trassenverlauf ungeklärt",
      color: layerColors.selectable,
      shape: "dashedLine",
      dots: true,
      secondColor: layerColors.dashedSubsectionSecondary,
    },
    { text: "Planungsabschnitte (Fläche)", color: layerColors.selectable, shape: "polygon" },
  ],
  subsection: [
    { text: "Eintrag", color: layerColors.entryDefault, shape: "line", dots: true },
    { text: "Punktueller Eintrag", color: layerColors.entryDefault, shape: "circle" },
    { text: "Eintrag (Fläche)", color: layerColors.entryDefault, shape: "polygon" },
    {
      text: "Eintrag - Gestrichelt",
      color: layerColors.entryDefault,
      shape: "dashedLine",
      dots: true,
      secondColor: layerColors.dashedEntrySecondary,
    },
    {
      text: "Ausgewählter Planungsabschnitt",
      color: layerColors.selectedSubsection,
      shape: "line",
    },
    {
      text: "Ausgewählter Planungsabschnitt (Fläche)",
      color: layerColors.selectedSubsection,
      shape: "polygon",
    },
    { text: "Andere Planungsabschnitte", color: layerColors.unselectableSubsection, shape: "line" },
    {
      text: "Andere Planungsabschnitte (Fläche)",
      color: layerColors.unselectableSubsection,
      shape: "polygon",
    },
    {
      text: "Planungsabschnitte - Trassenverlauf ungeklärt",
      color: layerColors.selectedSubsection,
      shape: "dashedLine",
      secondColor: layerColors.dashedSubsectionSecondary,
    },
  ],
  subsubsection: [
    { text: "Ausgewählter Eintrag", color: layerColors.selected, shape: "line", dots: true },
    { text: "Eintrag", color: layerColors.entryDefault, shape: "line", dots: true },
    { text: "Ausgewählter Punktueller Eintrag", color: layerColors.selected, shape: "circle" },
    { text: "Punktueller Eintrag", color: layerColors.entryDefault, shape: "circle" },
    { text: "Ausgewählter Eintrag (Fläche)", color: layerColors.selected, shape: "polygon" },
    { text: "Eintrag (Fläche)", color: layerColors.entryDefault, shape: "polygon" },
    {
      text: "Eintrag - Gestrichelt",
      color: layerColors.entryDefault,
      shape: "dashedLine",
      dots: true,
      secondColor: layerColors.dashedEntrySecondary,
    },
    {
      text: "Ausgewählter Planungsabschnitt",
      color: layerColors.selectedSubsection,
      shape: "line",
    },
    { text: "Andere Planungsabschnitte", color: layerColors.unselectableSubsection, shape: "line" },
  ],
}
