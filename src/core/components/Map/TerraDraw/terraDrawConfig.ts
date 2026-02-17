import type { HexColor } from "terra-draw"
import {
  TerraDrawFreehandLineStringMode,
  TerraDrawLineStringMode,
  TerraDrawPointMode,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
} from "terra-draw"

export const TERRA_DRAW_COLORS = {
  drawing: "#F8C62B" as HexColor,
  selectedDark: "#F8C62B" as HexColor,
  selectionPoint: "#c33cb68c" as HexColor,
  editHandle: "#ec407a" as HexColor,
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
    // Smaller hit area so midpoint can win over corners when segment is long enough.
    // Default 40px causes corner and midpoint to overlap on short segments (wrong action).
    pointerDistance: 12,
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
          coordinates: { draggable: true, midpoints: { draggable: true } },
        },
      },
      "freehand-linestring": {
        feature: {
          draggable: true,
          coordinates: { draggable: true, midpoints: { draggable: true } },
        },
      },
      polygon: {
        feature: {
          draggable: true,
          coordinates: { draggable: true, midpoints: { draggable: true } },
        },
      },
    },
    styles: {
      // https://github.com/JamesLMilner/terra-draw/blob/main/guides/5.STYLING.md#selection-points
      // Corner/vertex points (selection points)
      selectedPointColor: TERRA_DRAW_COLORS.editHandle,
      selectionPointColor: TERRA_DRAW_COLORS.editHandle,
      selectionPointOpacity: 0.95,
      selectionPointWidth: 7,
      selectionPointOutlineColor: TERRA_DRAW_COLORS.editHandle,
      selectionPointOutlineWidth: 2,
      selectionPointOutlineOpacity: 0.95,
      selectedLineStringColor: TERRA_DRAW_COLORS.selectedDark,
      selectedPolygonColor: TERRA_DRAW_COLORS.selectedDark,
      selectedPolygonOutlineColor: TERRA_DRAW_COLORS.selectedDark,
      selectedPolygonFillOpacity: 0.3, // Semi-transparent yellow fill for selected polygon
      // Mid points (between-corner markers)
      midPointColor: TERRA_DRAW_COLORS.editHandle,
      midPointOutlineColor: TERRA_DRAW_COLORS.editHandle,
      midPointOpacity: 0.95,
      midPointWidth: 3,
      midPointOutlineWidth: 1,
      midPointOutlineOpacity: 0.95,
    },
  }),
]
