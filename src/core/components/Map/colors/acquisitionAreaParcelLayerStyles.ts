import { acquisitionAreaColors } from "@/src/core/components/Map/colors/acquisitionAreaColors"
import type { FillLayerSpecification, LineLayerSpecification } from "maplibre-gl"

export const acquisitionAreaParcelFillPaint: FillLayerSpecification["paint"] = {
  "fill-color": acquisitionAreaColors.parcel,
  "fill-opacity": 0.08,
}

export const acquisitionAreaParcelLineBasePaint: LineLayerSpecification["paint"] = {
  "line-color": acquisitionAreaColors.parcel,
  "line-opacity": 0.28,
  "line-width": 2,
}

export const acquisitionAreaParcelLineDashPaint: LineLayerSpecification["paint"] = {
  "line-color": acquisitionAreaColors.parcel,
  "line-width": 1.5,
  "line-dasharray": [3, 2],
}
