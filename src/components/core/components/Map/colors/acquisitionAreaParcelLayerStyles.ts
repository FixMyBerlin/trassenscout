import type {
  ExpressionSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
} from "maplibre-gl"
import { acquisitionAreaColors } from "@/src/components/core/components/Map/colors/acquisitionAreaColors"

/**
 * Reads the `hover` feature state a map sets via `setFeatureState`. Evaluates to false on maps
 * that never set it, so hover-aware paint stays safe to share with maps that have no hover.
 */
export const mapHoverExpression: ExpressionSpecification = [
  "boolean",
  ["feature-state", "hover"],
  false,
]

/** Darkens with the Verhandlungsfläche it belongs to when that area is hovered. */
export const acquisitionAreaParcelFillPaint: FillLayerSpecification["paint"] = {
  "fill-color": [
    "case",
    mapHoverExpression,
    acquisitionAreaColors.parcel,
    acquisitionAreaColors.parcelFill,
  ],
  "fill-opacity": ["case", mapHoverExpression, 0.22, 0.1],
}

export const acquisitionAreaParcelLineDashPaint: LineLayerSpecification["paint"] = {
  "line-color": acquisitionAreaColors.parcel,
  "line-opacity": 0.5,
  "line-width": 1.5,
  "line-dasharray": [3, 2],
}
