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
  ],
  subsection: [
    { text: "Eintrag", color: layerColors.selectable, shape: "line", dots: true },
    { text: "Punktueller Eintrag", color: layerColors.selectable, shape: "circle" },
    {
      text: "Ausgewählter Planungsabschnitt",
      color: layerColors.unselectableCurrent,
      shape: "line",
    },
    { text: "Andere Planungsabschnitte", color: layerColors.unselectable, shape: "line" },
  ],
  subsubsection: [
    { text: "Ausgewählter Eintrag", color: layerColors.selected, shape: "line", dots: true },
    { text: "Eintrag", color: layerColors.selectable, shape: "line", dots: true },
    { text: "Ausgewählter Punktueller Eintrag", color: layerColors.selected, shape: "circle" },
    { text: "Punktueller Eintrag", color: layerColors.selectable, shape: "circle" },
    {
      text: "Ausgewählter Planungsabschnitt",
      color: layerColors.unselectableCurrent,
      shape: "line",
    },
    { text: "Andere Planungsabschnitte", color: layerColors.unselectable, shape: "line" },
  ],
}
