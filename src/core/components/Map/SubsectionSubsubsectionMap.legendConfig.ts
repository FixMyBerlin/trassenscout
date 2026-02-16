import { LegendItemConfig } from "@/src/core/components/Map/MapLegend"

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
    text: "Eintrag",
    iconIds: ["subsubsectionLine", "subsubsectionPoint", "subsubsectionPolygon"],
  },
  {
    text: "Eintrag mit besonderem Status",
    iconIds: ["subsubsectionLineDashed", "subsubsectionPointDashed", "subsubsectionPolygonDashed"],
  },
]
