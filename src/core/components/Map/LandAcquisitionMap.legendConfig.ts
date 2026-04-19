import { LegendItemConfig } from "@/src/core/components/Map/MapLegend"

export const landAcquisitionLegendConfig: LegendItemConfig[] = [
  {
    text: "Flurstück",
    iconIds: ["acquisitionParcelPolygon"],
  },
  {
    text: "Eintrag",
    iconIds: ["subsubsectionLine", "subsubsectionPolygon"],
  },
  {
    text: "Verhandlungsfläche",
    iconIds: ["acquisitionAreaPolygon"],
  },
]
