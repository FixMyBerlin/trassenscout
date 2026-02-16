import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  HeatmapLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
} from "maplibre-gl"

export type StaticOverlayLayerSpec = (
  | Omit<FillLayerSpecification, "source" | "source-layer" | "metadata">
  | Omit<LineLayerSpecification, "source" | "source-layer" | "metadata">
  | Omit<SymbolLayerSpecification, "source" | "source-layer" | "metadata">
  | Omit<CircleLayerSpecification, "source" | "source-layer" | "metadata">
  | Omit<HeatmapLayerSpecification, "source" | "source-layer" | "metadata">
) & {
  beforeId?: string
}

export type StaticOverlaySource = {
  pmTilesUrl: string
  layers: StaticOverlayLayerSpec[]
}

export type StaticOverlayConfig = {
  sources: Record<string, StaticOverlaySource>
}
