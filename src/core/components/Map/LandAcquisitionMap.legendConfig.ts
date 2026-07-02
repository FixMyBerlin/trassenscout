import { LegendItemConfig } from "@/src/core/components/Map/MapLegend"
import { LegendIconId } from "@/src/core/components/Map/legendIconRegistry"

const iconIdByAcquisitionAreaStatusStyle: Record<number, LegendIconId> = {
  1: "acquisitionAreaPolygonStatus1",
  2: "acquisitionAreaPolygonStatus2",
  3: "acquisitionAreaPolygonStatus3",
  4: "acquisitionAreaPolygonStatus4",
}

const baseLegendConfig: LegendItemConfig[] = [
  {
    text: "Flurstück",
    iconIds: ["acquisitionParcelPolygon"],
  },
  {
    text: "Eintrag",
    iconIds: ["subsubsectionLine", "subsubsectionPolygon"],
  },
]

export const getLandAcquisitionLegendConfig = (
  acquisitionAreaStatusStyles: number[],
): LegendItemConfig[] => {
  const statusIconIds = Array.from(
    new Set<LegendIconId>([
      "acquisitionAreaPolygonStatus1",
      ...acquisitionAreaStatusStyles.map(
        (style) => iconIdByAcquisitionAreaStatusStyle[style] ?? "acquisitionAreaPolygonStatus1",
      ),
    ]),
  )

  return [
    ...baseLegendConfig,
    {
      text: "Verhandlungsflächen nach Phase",
      iconIds: statusIconIds,
    },
  ]
}
