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
      secondColor: layerColors.background,
    },
    { text: "Planungsabschnitte (Fläche)", color: layerColors.selectable, shape: "polygon" },
  ],
  subsection: [
    { text: "Eintrag", color: layerColors.selectable, shape: "line", dots: true },
    { text: "Punktueller Eintrag", color: layerColors.selectable, shape: "circle" },
    { text: "Eintrag (Fläche)", color: layerColors.selectable, shape: "polygon" },
    {
      text: "Ausgewählter Planungsabschnitt",
      color: layerColors.unselectableCurrent,
      shape: "line",
    },
    {
      text: "Ausgewählter Planungsabschnitt (Fläche)",
      color: layerColors.unselectableCurrent,
      shape: "polygon",
    },
    { text: "Andere Planungsabschnitte", color: layerColors.unselectable, shape: "line" },
    {
      text: "Andere Planungsabschnitte (Fläche)",
      color: layerColors.unselectable,
      shape: "polygon",
    },
  ],
  subsubsection: [
    { text: "Ausgewählter Eintrag", color: layerColors.selected, shape: "line", dots: true },
    { text: "Eintrag", color: layerColors.selectable, shape: "line", dots: true },
    { text: "Ausgewählter Punktueller Eintrag", color: layerColors.selected, shape: "circle" },
    { text: "Punktueller Eintrag", color: layerColors.selectable, shape: "circle" },
    { text: "Ausgewählter Eintrag (Fläche)", color: layerColors.selected, shape: "polygon" },
    { text: "Eintrag (Fläche)", color: layerColors.selectable, shape: "polygon" },
    {
      text: "Ausgewählter Planungsabschnitt",
      color: layerColors.unselectableCurrent,
      shape: "line",
    },
    { text: "Andere Planungsabschnitte", color: layerColors.unselectable, shape: "line" },
  ],
}
