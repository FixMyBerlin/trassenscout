import { LegendItemConfig } from "@/src/core/components/Map/MapLegend"

export const projectLegendConfig: LegendItemConfig[] = [
  {
    text: "Planungsabschnitte",
    iconIds: ["subsectionLineDefault", "subsectionPolygonDefault"],
  },
  {
    text: "Verlauf ungeklärt",
    iconIds: ["subsectionLineDashed", "subsectionPolygonDashed"],
  },
]
