import { LegendItemConfig } from "@/src/components/core/components/Map/MapLegend"

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
