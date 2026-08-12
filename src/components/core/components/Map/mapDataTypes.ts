import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  HeatmapLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
} from "maplibre-gl"

export const MapSourceType = {
  geojson: "geojson",
  pmtiles: "pmtiles",
} as const

export type MapSourceType = (typeof MapSourceType)[keyof typeof MapSourceType]

export type StaticMapLayer = (
  | Omit<FillLayerSpecification, "source" | "source-layer" | "metadata">
  | Omit<LineLayerSpecification, "source" | "source-layer" | "metadata">
  | Omit<SymbolLayerSpecification, "source" | "source-layer" | "metadata">
  | Omit<CircleLayerSpecification, "source" | "source-layer" | "metadata">
  | Omit<HeatmapLayerSpecification, "source" | "source-layer" | "metadata">
) & {
  beforeId?: string
}

export type MapData = {
  sources: Record<
    string,
    {
      /** Full endpoint URL including format suffix (TILDA `.geojson`/`.pmtiles`, or Trassenscout `/api/projects/{slug}.json`). */
      externalUrl: string
      type: MapSourceType
      /**
       * GeoJSON only: property used as Feature id for `setFeatureState` (hover/selected).
       * Required when GeoJSON `id` is a non-numeric string (MapLibre ignores those).
       */
      promoteId?: string
      layers: StaticMapLayer[]
      interactiveLayerIds?: string[]
    }
  >
}
