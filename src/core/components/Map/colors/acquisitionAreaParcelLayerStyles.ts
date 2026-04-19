import type { FillLayerSpecification, LineLayerSpecification } from "maplibre-gl"

export const acquisitionAreaParcelFillPaint: FillLayerSpecification["paint"] = {
  "fill-color": "#ec4899",
  "fill-opacity": 0.08,
}

export const acquisitionAreaParcelLineBasePaint: LineLayerSpecification["paint"] = {
  "line-color": "#ec4899",
  "line-opacity": 0.28,
  "line-width": 2,
}

export const acquisitionAreaParcelLineDashPaint: LineLayerSpecification["paint"] = {
  "line-color": "#ec4899",
  "line-width": 1.5,
  "line-dasharray": [3, 2],
}
