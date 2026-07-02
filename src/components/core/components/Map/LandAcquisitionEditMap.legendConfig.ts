import { LegendIconId } from "@/src/components/core/components/Map/legendIconRegistry"
import { LegendItemConfig } from "@/src/components/core/components/Map/MapLegend"

const iconIdByAcquisitionAreaStatusStyle: Record<number, LegendIconId> = {
  1: "acquisitionAreaPolygonStatus1",
  2: "acquisitionAreaPolygonStatus2",
  3: "acquisitionAreaPolygonStatus3",
  4: "acquisitionAreaPolygonStatus4",
}

export const getLandAcquisitionEditLegendConfig = (acquisitionAreaStatusStyle?: number) => {
  const statusIconId =
    iconIdByAcquisitionAreaStatusStyle[acquisitionAreaStatusStyle ?? 1] ??
    "acquisitionAreaPolygonStatus1"

  return [
    {
      text: "Flurstück",
      iconIds: ["acquisitionParcelPolygonEdit"],
    },
    {
      text: "Maßnahme ",
      iconIds: ["subsubsectionLine", "subsubsectionPolygon"],
    },
    {
      text: "Verhandlungsfläche",
      iconIds: [statusIconId],
    },
  ] satisfies LegendItemConfig[]
}
