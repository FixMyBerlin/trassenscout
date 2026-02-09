import { sharedColors } from "@/src/core/components/Map/colors/sharedColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import type { HexColor } from "terra-draw"
import {
  TerraDrawFreehandLineStringMode,
  TerraDrawLineStringMode,
  TerraDrawPointMode,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
} from "terra-draw"

export const TERRA_DRAW_COLORS = {
  drawing: sharedColors.hovered as HexColor, // Yellow for edited feature
  selectedDark: sharedColors.hovered as HexColor, // Yellow for selected feature
  selectionPoint: subsubsectionColors.lineDotSelected as HexColor, // Light blue for corner/vertex points
}

// DOCS STYLING: https://github.com/JamesLMilner/terra-draw/blob/main/guides/5.STYLING.md
export const createTerraDrawModes = () => [
  new TerraDrawPointMode({
    styles: { pointColor: TERRA_DRAW_COLORS.drawing },
  }),
  new TerraDrawLineStringMode({
    styles: { lineStringColor: TERRA_DRAW_COLORS.drawing },
  }),
  new TerraDrawFreehandLineStringMode({
    styles: { lineStringColor: TERRA_DRAW_COLORS.drawing },
  }),
  new TerraDrawPolygonMode({
    styles: {
      outlineColor: TERRA_DRAW_COLORS.drawing,
      fillColor: TERRA_DRAW_COLORS.drawing, // Yellow fill for polygons
      fillOpacity: 0.3, // Semi-transparent yellow fill
    },
  }),
  new TerraDrawSelectMode({
    flags: {
      point: {
        feature: {
          draggable: true,
          coordinates: { draggable: true },
        },
      },
      linestring: {
        feature: {
          draggable: true,
          coordinates: { draggable: true },
        },
      },
      "freehand-linestring": {
        feature: {
          draggable: true,
          coordinates: { draggable: true },
        },
      },
      polygon: {
        feature: {
          draggable: true,
          coordinates: { draggable: true },
        },
      },
    },
    styles: {
      // https://github.com/JamesLMilner/terra-draw/blob/main/guides/5.STYLING.md#selection-points
      selectedPointColor: TERRA_DRAW_COLORS.selectionPoint, // Light blue for corner/vertex points
      selectionPointColor: TERRA_DRAW_COLORS.selectionPoint, // Light blue for corner/vertex points
      selectedLineStringColor: TERRA_DRAW_COLORS.selectedDark, // Yellow for selected line
      selectedPolygonColor: TERRA_DRAW_COLORS.selectedDark, // Yellow for selected polygon outline
      selectedPolygonFillOpacity: 0.3, // Semi-transparent yellow fill for selected polygon
    },
  }),
]
