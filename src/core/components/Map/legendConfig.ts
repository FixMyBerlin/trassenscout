import { layerColors } from "@/src/core/components/Map/layerColors"
import { LegendItemConfig } from "@/src/core/components/Map/MapLegend"

export const legendItemsConfig: Record<string, LegendItemConfig[]> = {
  project: [{ text: "Planungsabschnitte", color: layerColors.selectable, shape: "line" }],
  subsection: [
    { text: "Regelführung", color: layerColors.selectable, shape: "line", dots: true },
    { text: "Sonderführung", color: layerColors.selectable, shape: "circle" },
    {
      text: "Ausgewählter Planungsabschnitt",
      color: layerColors.unselectableCurrent,
      shape: "line",
    },
    { text: "Andere Planungsabschnitte", color: layerColors.unselectable, shape: "line" },
  ],
  subsubsection: [
    { text: "Ausgewählte Regelführung", color: layerColors.selected, shape: "line", dots: true },
    { text: "Regelführung", color: layerColors.selectable, shape: "line", dots: true },
    { text: "Ausgewählte Sonderführung", color: layerColors.selected, shape: "circle" },
    { text: "Sonderführung", color: layerColors.selectable, shape: "circle" },
    {
      text: "Ausgewählter Planungsabschnitt",
      color: layerColors.unselectableCurrent,
      shape: "line",
    },
    { text: "Andere Planungsabschnitte", color: layerColors.unselectable, shape: "line" },
  ],
}
