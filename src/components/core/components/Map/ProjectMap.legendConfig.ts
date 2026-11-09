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

export const projectSearchLegendConfig: LegendItemConfig[] = [
  {
    text: "Planungsabschnitte mit Treffern",
    iconIds: ["subsectionLineDefault", "subsectionPolygonDefault"],
  },
  {
    text: "Planungsabschnitte ohne Treffer",
    iconIds: ["subsectionLineFaded", "subsectionHullPolygonFaded"],
  },
  {
    text: "Verlauf ungeklärt",
    iconIds: ["subsectionLineDashed", "subsectionPolygonDashed"],
  },
]
