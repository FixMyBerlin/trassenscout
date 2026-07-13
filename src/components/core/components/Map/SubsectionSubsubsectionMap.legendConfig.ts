import { LegendItemConfig } from "@/src/components/core/components/Map/MapLegend"

export const subsectionLegendConfig: LegendItemConfig[] = [
  {
    text: "Aktueller Planungsabschnitt",
    iconIds: ["subsectionHullPolygonCurrent"],
  },
  {
    text: "Andere Planungsabschnitte",
    iconIds: ["subsectionHullPolygonUnselected"],
  },
  {
    text: "Maßnahme ",
    iconIds: ["subsubsectionLine", "subsubsectionPoint", "subsubsectionPolygon"],
  },
  {
    text: "Maßnahme  mit besonderem Status",
    iconIds: ["subsubsectionLineGreen", "subsubsectionPointGreen", "subsubsectionPolygonGreen"],
  },
]
